import Map "mo:core/Map";
import List "mo:core/List";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Types "../types/lottery";

module {

  // ── State shape ──────────────────────────────────────────────────────────
  public type State = {
    mobileUsers : Map.Map<Text, Types.MobileUser>;
    bets        : Map.Map<Text, Types.Bet>;
    drawResults : List.List<Types.DrawResult>;
    betCounter  : { var next : Nat };
  };

  public func initState() : State {
    {
      mobileUsers = Map.empty<Text, Types.MobileUser>();
      bets        = Map.empty<Text, Types.Bet>();
      drawResults = List.empty<Types.DrawResult>();
      betCounter  = { var next = 0 };
    };
  };

  // ── Auth helpers ─────────────────────────────────────────────────────────

  /// Verify device token matches stored user; return user on success.
  public func authenticate(
    state        : State,
    mobileNumber : Text,
    deviceToken  : Text
  ) : Types.Result<Types.MobileUser, Text> {
    switch (state.mobileUsers.get(mobileNumber)) {
      case null { #err("User not found") };
      case (?user) {
        if (user.deviceToken == deviceToken) { #ok(user) }
        else { #err("Invalid device token") };
      };
    };
  };

  // ── Mobile user management ───────────────────────────────────────────────

  public func registerMobileUser(
    state        : State,
    mobileNumber : Text,
    deviceToken  : Text,
    now          : Int
  ) : Types.Result<Text, Text> {
    if (state.mobileUsers.containsKey(mobileNumber)) {
      return #err("Mobile number already registered");
    };
    let user : Types.MobileUser = {
      mobileNumber;
      deviceToken;
      balance   = 0;
      createdAt = now;
    };
    state.mobileUsers.add(mobileNumber, user);
    #ok(deviceToken);
  };

  public func loginMobileUser(
    state        : State,
    mobileNumber : Text,
    deviceToken  : Text
  ) : Types.Result<Types.MobileUser, Text> {
    authenticate(state, mobileNumber, deviceToken);
  };

  public func getMobileUser(
    state        : State,
    mobileNumber : Text
  ) : ?Types.MobileUser {
    state.mobileUsers.get(mobileNumber);
  };

  public func getAllMobileUsers(state : State) : [Types.MobileUser] {
    state.mobileUsers.values().toArray();
  };

  // ── Balance management ───────────────────────────────────────────────────

  public func setBalance(
    state        : State,
    mobileNumber : Text,
    newBalance   : Int
  ) : Types.Result<(), Text> {
    switch (state.mobileUsers.get(mobileNumber)) {
      case null { #err("User not found") };
      case (?user) {
        state.mobileUsers.add(mobileNumber, { user with balance = newBalance });
        #ok(());
      };
    };
  };

  public func adjustBalance(
    state        : State,
    mobileNumber : Text,
    delta        : Int
  ) : Types.Result<(), Text> {
    switch (state.mobileUsers.get(mobileNumber)) {
      case null { #err("User not found") };
      case (?user) {
        state.mobileUsers.add(mobileNumber, { user with balance = user.balance + delta });
        #ok(());
      };
    };
  };

  // ── Bet operations ───────────────────────────────────────────────────────

  public func placeBet(
    state        : State,
    mobileNumber : Text,
    deviceToken  : Text,
    drawType     : Types.DrawType,
    drawLetter   : Types.DrawLetter,
    betType      : Types.BetType,
    number       : Text,
    rate         : Nat,
    now          : Int
  ) : Types.Result<Types.Bet, Text> {
    // Authenticate
    let user = switch (authenticate(state, mobileNumber, deviceToken)) {
      case (#err(e)) { return #err(e) };
      case (#ok(u))  { u };
    };
    // Validate number length
    let expectedLen = switch (drawType) {
      case (#twoD)   { 2 };
      case (#threeD) { 3 };
      case (#fourD)  { 4 };
    };
    if (number.size() != expectedLen) {
      return #err("Number must be " # expectedLen.toText() # " digits");
    };
    // Check balance
    let rateInt = rate.toInt();
    if (user.balance < rateInt) {
      return #err("Insufficient balance");
    };
    // Calculate potential win
    let potentialWin : Int = switch (drawType, betType) {
      case (#twoD,   #straight) { rateInt * 85  };
      case (#twoD,   _)         { rateInt * 85  }; // 2D only has straight
      case (#threeD, #box)      { rateInt * 83  };
      case (#threeD, #straight) { rateInt * 500 };
      case (#threeD, #sp)       { rateInt * 290 };
      case (#threeD, #dp)       { rateInt * 166 };
      case (#fourD,  #box)      { rateInt * 600 };
      case (#fourD,  #straight) { rateInt * 3500};
      case (#fourD,  #sp)       { rateInt * 2000};
      case (#fourD,  #dp)       { rateInt * 1200};
    };
    // Deduct balance
    state.mobileUsers.add(mobileNumber, { user with balance = user.balance - rateInt });
    // Create bet
    let betId = mobileNumber # "-" # now.toText() # "-" # state.betCounter.next.toText();
    state.betCounter.next += 1;
    let bet : Types.Bet = {
      id           = betId;
      mobileNumber;
      drawType;
      drawLetter;
      betType;
      number;
      rate;
      potentialWin;
      status   = #pending;
      placedAt = now;
    };
    state.bets.add(betId, bet);
    #ok(bet);
  };

  public func getMyBets(
    state        : State,
    mobileNumber : Text,
    deviceToken  : Text
  ) : [Types.Bet] {
    switch (authenticate(state, mobileNumber, deviceToken)) {
      case (#err(_)) { [] };
      case (#ok(_)) {
        state.bets.values()
          .filter(func(b : Types.Bet) : Bool { b.mobileNumber == mobileNumber })
          .toArray();
      };
    };
  };

  public func getAllBets(state : State) : [Types.Bet] {
    state.bets.values().toArray();
  };

  public func settleBet(
    state  : State,
    betId  : Text,
    status : Types.BetStatus
  ) : Types.Result<(), Text> {
    switch (state.bets.get(betId)) {
      case null { #err("Bet not found") };
      case (?bet) {
        state.bets.add(betId, { bet with status });
        #ok(());
      };
    };
  };

  // ── Draw results ─────────────────────────────────────────────────────────

  public func enterResult(
    state         : State,
    drawType      : Types.DrawType,
    drawLetter    : Types.DrawLetter,
    winningNumber : Text,
    drawnBy       : Text,
    now           : Int
  ) : Types.Result<Types.DrawResult, Text> {
    let result : Types.DrawResult = {
      drawType;
      drawLetter;
      winningNumber;
      drawnAt = now;
      drawnBy;
    };
    state.drawResults.add(result);
    #ok(result);
  };

  public func getLatestResults(state : State) : [Types.DrawResult] {
    let sorted = state.drawResults.sort(func(a : Types.DrawResult, b : Types.DrawResult) : { #less; #equal; #greater } {
      Int.compare(b.drawnAt, a.drawnAt)
    });
    sorted.values().take(10).toArray();
  };

  /// Auto-settle all pending bets for a given draw; returns count settled.
  public func autoSettleDraw(
    state      : State,
    drawType   : Types.DrawType,
    drawLetter : Types.DrawLetter
  ) : Types.Result<Nat, Text> {
    // Find latest result for this draw
    let latestResult = state.drawResults
      .find(func(r : Types.DrawResult) : Bool {
        r.drawType == drawType and r.drawLetter == drawLetter
      });
    let result = switch (latestResult) {
      case null { return #err("No result found for this draw") };
      case (?r) { r };
    };
    let winNum = result.winningNumber;
    var settledCount = 0;
    // Collect pending bets for this draw
    let pendingBets = state.bets.values()
      .filter(func(b : Types.Bet) : Bool {
        b.status == #pending and b.drawType == drawType and b.drawLetter == drawLetter
      })
      .toArray();
    for (bet in pendingBets.values()) {
      let isWin : Bool = switch (bet.betType) {
        case (#straight) { bet.number == winNum };
        case (#box) {
          // Check if bet.number is any permutation of winNum
          let bChars = bet.number.toArray();
          let wChars = winNum.toArray();
          if (bChars.size() != wChars.size()) { false }
          else {
            // Sort both and compare
            let bSorted = bChars.sort(func(a : Char, b : Char) : { #less; #equal; #greater } {
              Text.compare(Text.fromChar(a), Text.fromChar(b))
            });
            let wSorted = wChars.sort(func(a : Char, b : Char) : { #less; #equal; #greater } {
              Text.compare(Text.fromChar(a), Text.fromChar(b))
            });
            Text.fromArray(bSorted) == Text.fromArray(wSorted);
          };
        };
        case (#sp) {
          // Last 2 digits of winNum match
          let wSize = winNum.size();
          if (wSize < 2) { false }
          else {
            let last2 = winNum.toIter().drop(wSize - 2 : Nat).toArray();
            bet.number == Text.fromArray(last2);
          };
        };
        case (#dp) {
          // First 2 digits of winNum match
          let wSize = winNum.size();
          if (wSize < 2) { false }
          else {
            let first2 = winNum.toIter().take(2).toArray();
            bet.number == Text.fromArray(first2);
          };
        };
      };
      let newStatus : Types.BetStatus = if (isWin) #won else #lost;
      state.bets.add(bet.id, { bet with status = newStatus });
      // Pay out winnings
      if (isWin) {
        switch (state.mobileUsers.get(bet.mobileNumber)) {
          case null {};
          case (?user) {
            state.mobileUsers.add(bet.mobileNumber, { user with balance = user.balance + bet.potentialWin });
          };
        };
      };
      settledCount += 1;
    };
    #ok(settledCount);
  };

};
