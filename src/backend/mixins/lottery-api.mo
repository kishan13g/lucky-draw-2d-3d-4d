import Time "mo:core/Time";
import LotteryLib "../lib/lottery";
import Types "../types/lottery";

mixin (lotteryState : LotteryLib.State) {

  // ── Mobile auth ──────────────────────────────────────────────────────────

  public shared func registerMobileUser(
    mobileNumber : Text,
    deviceToken  : Text
  ) : async Types.Result<Text, Text> {
    LotteryLib.registerMobileUser(lotteryState, mobileNumber, deviceToken, Time.now());
  };

  public shared func loginMobileUser(
    mobileNumber : Text,
    deviceToken  : Text
  ) : async Types.Result<Types.MobileUser, Text> {
    LotteryLib.loginMobileUser(lotteryState, mobileNumber, deviceToken);
  };

  public query func getMobileUser(mobileNumber : Text) : async ?Types.MobileUser {
    LotteryLib.getMobileUser(lotteryState, mobileNumber);
  };

  // ── Player actions ───────────────────────────────────────────────────────

  public shared func placeBet(
    mobileNumber : Text,
    deviceToken  : Text,
    drawType     : Types.DrawType,
    drawLetter   : Types.DrawLetter,
    betType      : Types.BetType,
    number       : Text,
    rate         : Nat
  ) : async Types.Result<Types.Bet, Text> {
    LotteryLib.placeBet(lotteryState, mobileNumber, deviceToken, drawType, drawLetter, betType, number, rate, Time.now());
  };

  public query func getMyBets(
    mobileNumber : Text,
    deviceToken  : Text
  ) : async [Types.Bet] {
    LotteryLib.getMyBets(lotteryState, mobileNumber, deviceToken);
  };

  public query func getLatestResults() : async [Types.DrawResult] {
    LotteryLib.getLatestResults(lotteryState);
  };

  // ── Admin actions ────────────────────────────────────────────────────────

  public shared func adminSetBalance(
    mobileNumber : Text,
    newBalance   : Int
  ) : async Types.Result<(), Text> {
    LotteryLib.setBalance(lotteryState, mobileNumber, newBalance);
  };

  public shared func adminAdjustBalance(
    mobileNumber : Text,
    delta        : Int
  ) : async Types.Result<(), Text> {
    LotteryLib.adjustBalance(lotteryState, mobileNumber, delta);
  };

  public query func adminGetAllMobileUsers() : async [Types.MobileUser] {
    LotteryLib.getAllMobileUsers(lotteryState);
  };

  public shared func adminEnterResult(
    drawType      : Types.DrawType,
    drawLetter    : Types.DrawLetter,
    winningNumber : Text
  ) : async Types.Result<Types.DrawResult, Text> {
    LotteryLib.enterResult(lotteryState, drawType, drawLetter, winningNumber, "admin", Time.now());
  };

  public query func adminGetAllBets() : async [Types.Bet] {
    LotteryLib.getAllBets(lotteryState);
  };

  public shared func adminSettleBet(
    betId  : Text,
    status : Types.BetStatus
  ) : async Types.Result<(), Text> {
    LotteryLib.settleBet(lotteryState, betId, status);
  };

  public shared func adminAutoSettleDraw(
    drawType   : Types.DrawType,
    drawLetter : Types.DrawLetter
  ) : async Types.Result<Nat, Text> {
    LotteryLib.autoSettleDraw(lotteryState, drawType, drawLetter);
  };

};
