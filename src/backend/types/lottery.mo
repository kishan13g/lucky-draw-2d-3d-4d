
module {

  // Generic result variant — avoids deprecated mo:core/Result
  public type Result<O, E> = { #ok : O; #err : E };

  // Player identified by mobile number; one device token per mobile
  public type MobileUser = {
    mobileNumber : Text;
    deviceToken  : Text;
    balance      : Int;
    createdAt    : Int;
  };

  public type DrawType   = { #twoD; #threeD; #fourD };
  public type DrawLetter = { #A; #B; #C };
  public type BetType    = { #straight; #box; #sp; #dp };
  public type BetStatus  = { #pending; #won; #lost };

  public type Bet = {
    id          : Text;
    mobileNumber: Text;
    drawType    : DrawType;
    drawLetter  : DrawLetter;
    betType     : BetType;
    number      : Text;
    rate        : Nat;
    potentialWin: Int;
    status      : BetStatus;
    placedAt    : Int;
  };

  public type DrawResult = {
    drawType      : DrawType;
    drawLetter    : DrawLetter;
    winningNumber : Text;
    drawnAt       : Int;
    drawnBy       : Text;
  };

};
