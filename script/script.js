// JQuery closure. For plain JS closure use (function() {} ) ();
$(function() {
  // declared locally within the main scope to be accessible and manipulated by any function as needed
  var theShoe = [];
  var minBet = 10;
  var playerBet = 0;
  var betPlacedForRound = false;
  var betButtonsIDs = ['#bet10','#bet25', '#bet50', '#bet100'];
  var playButtonsIDs = ['#hit','#stand'];
  var playerBalance = 2000;

  // used to store the hand of the player
  var playerHandArray = [];
  //var playerCurrentHand = [];

  // used to store the hand of the dealer
  var dealerHandArray = [];
  // declared here so the value will be accessible when needed to revela the hidden card
  // the array will be cleared internally in the calculateHand (where it gets populated) to prevent dupes
  var dealerCardsToDisplay =[];

  // used to store the value that sets whose turn it currently is so it can be passed
  // to as an argument to the functions that will handle both player and dealer.
  var whoIsPlaying = "player";
  var playerIsDonePlayingForThisRound = false;

  var currentCardPropertiesArray = [];

  var currentPlayerTotal = 0;

  var roundWinner = "";

  var pointWasBlackJack = false;

  /*=============*/
  /* UI ELEMENTS */
  /*=============*/
  // we create and append the elements to display the dealer's and player's current hand (Dealer will show only 1 card)
  var dealerHandPointsDisplay = $('<div id="dealer-hand-display-points">Dealer Hand<br /><div class="hand-points"></div></div>');
  $('#game-container').append(dealerHandPointsDisplay);
  var playerHandPointsDisplay = $('<div id="player-hand-display-points">Player Hand<br /><div class="hand-points"></div></div>');
  $('#game-container').append(playerHandPointsDisplay);

  var roundWinnerDisplay = $('<div id="round-winner"></div>');
  $('#game-container').append(roundWinnerDisplay);


  // we create and append the elements to display the player's current balance
  var playerBalanceDisplay = $('<div id="player-balance-display-title">Player Balance</div><div id="player-balance-display"></div>');
  $('#game-container').append(playerBalanceDisplay);

  // we add the "deal" button and we hide it. We will toggle it once the player will have place and confirmed a bet
  var dealInitialHandButton = $('<div id="deal-initial-hand-button">Deal!</div>');
  $('#game-container').append(dealInitialHandButton);
  $('#deal-initial-hand-button').toggleClass('hide');
  $('#deal-initial-hand-button').on('click', function(){
    dealInitialHand();
  });


  /*=============================================================================*/
  /* PLACE BET TO START PLAYING. RENDER PLAY AND BETTING BUTTONS HIDE AS NEEDED  */
  /*=============================================================================*/

  // We create and append the play options buttons:

  // THE HIT BUTTON
  var hitButton = $('<div id="hit">Hit</div>');
  $('#game-container').append(hitButton);

  //Once created we add a click event listener to the hit button
  $('#hit').on('click', function() {
    var currentPlayerTotal = $('#player-hand-display-points>div').text();
    console.log(currentPlayerTotal);
      if (currentPlayerTotal < 21) {
        hitPlayer();
      }
    })

  // THE STAND BUTTON
  var standButton = $('<div id="stand">Stand</div>');
  $('#game-container').append(standButton);
  $('#stand').on('click', function() {
    var currentPlayerTotal = $('#player-hand-display-points>div').text();
    console.log(currentPlayerTotal);
      if (currentPlayerTotal <= 21) {
        playerStand();
      }
    })


  // we create and appedn the betting buttons
  var bet10Button = $('<div id="bet10">10</div>');
  $('#game-container').append(bet10Button);
  var bet25Button = $('<div id="bet25">25</div>');
  $('#game-container').append(bet25Button);
  var bet50Button = $('<div id="bet50">50</div>');
  $('#game-container').append(bet50Button);
  var bet100Button = $('<div id="bet100">100</div>');
  $('#game-container').append(bet100Button);

  // this function will update the player balance display
  var updatePlayerBalanceDisplay = function(playerBalance){
    $('#player-balance-display').text(playerBalance);
  }

  // once placed, the bet needs to be confirmed by the player before the round can begin
  // once confirmed, the bet will be final. The player can't retract or change it later
  var confirmBet = function(playerBet){
    // hide all betting buttons
    betButtonsIDs.forEach(function(element){
        $(element).css('display', 'none');
    });
    // prompt player to confirm the bet placed
    // create and append the confirm button
    var confirmButton = $('<div id=\'confirm-bet\'>Confirm bet: '+ playerBet+'<br /><div class=\'btn-yes\'>YES</div><br /><div class=\'btn-no\'>NO</div></div>')
    $('div#game-container').append(confirmButton);

    // add an event listener to the yes button of the confirm bet prompt
    $('#confirm-bet .btn-yes').on('click', function (){
      playerBalance -= playerBet; // we subtract the amount of the bet from the total of the current balance
      updatePlayerBalanceDisplay(playerBalance); //we update the display subtracting the amount of the bet
      betPlacedForRound = true; // we set the flag to lock the current bet... after confirmation "rien va plus"
      $('#min-bet-message').remove();// we remove the minimum bet message,
      $('#confirm-bet').remove();// we remove the confirmation prompt...
      //...replacing it with a field showing the amount of the placed bet
      var placedBetDisplay = $('<div id=\'placed-bet-display\'>Confirmed<br />bet: '+ playerBet+'</div>')
      $('div#game-container').append(placedBetDisplay);
      // now we want to show a deal button to deal the initial hand (2 cards to the player and 2 cards to the dealer)
      $('#deal-initial-hand-button').toggleClass('hide');

    });

    // add an event listener to the no button of the confirm bet prompt
    $('#confirm-bet .btn-no').on('click', function (){
      $('#confirm-bet').remove();// simply remove the confirm prompt
      // show all betting buttons
      betButtonsIDs.forEach(function(element){
          $(element).css('display', 'block');
      });
    })

  }

  // we add an event listener for all the betting buttons which we'll target by ID
  $('#bet10').on('click', function (){
    if (!betPlacedForRound){
      playerBet = 10;
      confirmBet(playerBet);
    }
  });
  $('#bet25').on('click', function (){
    if (!betPlacedForRound){
      playerBet = 25;
      confirmBet(playerBet);
    }
  });
  $('#bet50').on('click', function (){
    if (!betPlacedForRound){
      playerBet = 50;
      confirmBet(playerBet);
    }
  });
  $('#bet100').on('click', function (){
    if (!betPlacedForRound){
      playerBet = 100;
      confirmBet(playerBet);
    }
  });

  var hidePlayOptionButtons = function (){
    playButtonsIDs.forEach(function (element){
      if ($(element).hasClass('hide')){
        return;
      }else{
        $(element).addClass('hide');
      }
    });
  }

  var showPlayOptionButtons = function (){
    playButtonsIDs.forEach(function (element){
      if ($(element).hasClass('hide')){
        $(element).removeClass('hide');
      }else{
        return;
      }
    });
  }








  /*=======================================================================*/
  /* CREATE AND SHUFFLE THE DECK, THEN STORE IT IN THE SHOE 8 DECKS TOTAL  */
  /*=======================================================================*/
  // shuffle function provided:
  // function shuffle(o){
  //     for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  //     return o;
  // }

  //make multi deck of cards (containing the cards from 8 standard decks, minus the jokers)
  var createNewDeck = function() {
    theShoe = []; // we reset the deck before creating a new one to put in the shoe and be ready to play
    // then we add 8 decks to it iterating 8 times pushing 52 cards each time for a total of 416 cards
    for (j = 0; j < 1; j++) { // creates decks 1 though 8
      for (i = 0; i < 52; i++) { //creates cards 1 through 52 per each created deck
        theShoe.push(i);
      }
    }
    for (var j, x, i = theShoe.length; i; j = Math.floor(Math.random() * i), x = theShoe[--i], theShoe[i] = theShoe[j], theShoe[j] = x);
  }

  createNewDeck(); //we create the first deck
  //console.log('Content of the shoe: '+ theShoe);

  /*===================================================================================================*/
  /* DEAL SINGLE CARDS FROM THE SHOE AND RETURN AN ARRAY OF PROPERTIES: NAME, SUIT, VALUES             */
  /*===================================================================================================*/
  function dealCard() {
    // we get the total of cards we have left
    var cardsLeftInTheShoe = theShoe.length;
    //console.log('There are ' + cardsLeftInTheShoe + ' in the shoe before dealing...');
    // then we get the value of the first card in theShoe and we add one to get card values between 1 an 13
    var currentCardValue1 = Math.floor(theShoe[0] % 13) + 1;
    // we define this second value to determine the dual value of the Ace cards (1 or 11)
    // All remaining cards will have the same value for value1 and 2.
    var currentCardValue2;
    // console.log('current card: ' + currentCardValue1);

    // We use aswitch statement to set the name of the card, currentCardValue1 is used.
    switch (currentCardValue1) {
      case 1:
        currentCardValue1 = 1;
        currentCardValue2 = 11;
        var currentCardName = "Ace";
        break;
      case 11:
        currentCardValue1 = 10;
        currentCardValue2 = 10; // Same value
        var currentCardName = "Jack";
        break;
      case 12:
        currentCardValue1 = 10;
        currentCardValue2 = 10
        var currentCardName = "Queen";
        break;
      case 13:
        currentCardValue1 = 10;
        currentCardValue2 = 10;
        var currentCardName = "King";
        break;
      default:
        currentCardValue1 = currentCardValue1; // sets currentCardValue1 as default value for cards 2~10 assigning them their respective values (2=2, 3=3...10=10)
        currentCardValue2 = currentCardValue1; // sets currentCardValue2 to same value as currentCardValue1
        var currentCardName = currentCardValue1.toString();
    }


    // Now we need to find the suit for the currentCardValue
    var currentCardSuit; //this variable will store the value of the suit for the card being dealt
    var determineCurrentCardSuit = Math.floor(theShoe[0] / 13);
    switch (determineCurrentCardSuit) {
      case 0:
        currentCardSuit = "Spades";
        break;
      case 1:
        currentCardSuit = "Hearts";
        break;
      case 2:
        currentCardSuit = "Diamonds";
        break;
      case 3:
        currentCardSuit = "Clubs";
        break;
      default:
    }
    //console.log('the current card is: ' + currentCardName + ' of ' + currentCardSuit);

    // we add the card name suit value and alternate value into the currentCardPropertiesArray array
    // this will allow us to use that data for filtering and calclulating later for game logic and UI
    currentCardPropertiesArray = [currentCardName, currentCardSuit, currentCardValue1, currentCardValue2];

    // once we pulled the card from the shoe (assigning it to currentCardValue so that we can return its value)
    // we remove it from theShoe to get it ready to serve the next hand
    theShoe.shift();

    //console.log('shoe now has ' + theShoe.length + ' cards left');

    // currentCardPropertiesArray needs to be returned so that caller will be able to capture the array
    // and use the items in it to work out game logic and UI
    return currentCardPropertiesArray;
  }


  /*===================================================================================================*/
  /* DEAL A SINGLE HAND GETS THE ARRAY OF PROPERTIES: NAME, SUIT, VALUES FROM THE CALLED FUNCTION      */
  /*===================================================================================================*/
  var dealHand = function(whoIsPlaying) {
    // if the shoe runs out of cards create a new one so we can continue playing
    if (theShoe.length === 0) {
      createNewDeck();
    }
    // We deal 1 cards to the player and..
    // ...we store the array returned by the dealCard() function in the dealtCard variable
    // this variable is re-initualized each time to hold a new value

    var dealtCard = dealCard();

    // Once captured the value returned by the functon we push(dealtCard) into playerHandArray or dealerHandArray. That's
    // the currentCardPropertiesArray returned from the dealCard() function contains the name, the suit and value/s of the
    // dealt card which will now be stored in the playerHandArray or the dealerHandArray.
    if (whoIsPlaying === "player"){
      playerHandArray.push(dealtCard);
    }else if (whoIsPlaying ==="dealer"){
      dealerHandArray.push(dealtCard);
    }


  }

  // We deal the initial hands (alternating dealing cards to player and dealer), serving both 2 cards...
  // The first card for the dealer will be face down (set when renreding the cards)
  var dealInitialHand = function (){
    dealHand('player');
    dealHand('dealer');
    dealHand('player');
    dealHand('dealer');
    console.log(playerHandArray+'\n\n'+dealerHandArray);
    calculateHand('player');
    calculateHand('dealer');
    // we show the option buttons to play ony if plaeyer or dealer or both got no blackjack
    $('#deal-initial-hand-button').toggleClass('hide');
    var playerHandDisplayValue = $('#player-hand-display-points>div').text();
    var dealerHandDisplayValue = $('dealer-hand-display-points>div').text();
    if (playerHandDisplayValue !== 21 && dealerHandDisplayValue !== 21){
      showPlayOptionButtons();
    }
  }

  /*=====================================*/
  /* HERE WE CALCULATE THE CURRENT HAND  */
  /*====================================s=*/
  var calculateHand = function(nowIsTheTurnOf) {
    //PLAYER HAND CALCULATION
    if (nowIsTheTurnOf === "player"){
      var playerCardsToDisplay =[]
      var numberOfCardsDealt = playerHandArray.length;
      console.log(playerHandArray);
      console.log('The player has been dealt ' + numberOfCardsDealt + ' cards');
      var calculatingPlayerHandArray = [];
      var cardFace = [];

      /*===========================================================================*/
      // HERE WE CALCULATE THE PLAYER'S HAND
      /*===========================================================================*/
      playerHandArray.map(function(element) {
        //console.log(element);
        calculatingPlayerHandArray.push(element[2]);// this gets the value of the Ace when the card is an Ace
        cardFace.push(element[0]);
        cardFace.push(element[1]);
        var cardNameForSVG = cardFace.toString();
        var removeComma = /\,/gi;
        cardNameForSVG = cardNameForSVG.replace(removeComma, '');
        playerCardsToDisplay.push(cardNameForSVG);
        // We clear the variable to get it ready for the Nth element in the map
        // if not cleared the 2nd card name will contain the 1st one, the 3rd would contain 1st, 2nd and 3rd... and so on
        cardNameForSVG="";
        cardFace=[];
        // we sort the array to put all the aces at the end so we can count them to determine when they should count as 11 or 1
        calculatingPlayerHandArray = calculatingPlayerHandArray.sort(function(a, b) {
          return b - a;
        });
      })

      // we render the card for for the player's hand
      renderDealtCards(playerCardsToDisplay, 'player');

      console.log('sorted array: ' + calculatingPlayerHandArray)

      var cardsSum = 0;//Reset each time we start calculating
      for (i = 0; i < calculatingPlayerHandArray.length; i++) {

        if (calculatingPlayerHandArray[i] === 1) {// if we find an ace, which we get as default value of 1 in the sorted array...
          //(sum is reset on each calculation)
          var sum = cardsSum + 11 + (calculatingPlayerHandArray.length - (i + 1));
          console.log('the sum is:'+ sum);
          if (sum > 21) {// if there are aces and the sum of the card will exceed 21 if we count them as 11 points
            cardsSum += 1 // count the ace/s as 1 point
          }else if(sum <= 21) {// if there is an ace and the sum is less than or equal to 21
            cardsSum = calculatingPlayerHandArray[i] + 11 // we count that ace as 11 points
          }
        // if no aces are found in the sorted array
      } else {// we just add the value of all cards together
          cardsSum += calculatingPlayerHandArray[i];
        }
      }

      console.log('Player Total = ' + cardsSum);
      console.log(cardFace.toString());

      // Once we have the current sum of the cards in the current hand, we update the points display
      $('#player-hand-display-points>div').text(cardsSum);

      // we check to see if the player has blackjack in this case it's only for the firs count
      if (cardsSum === 21) {
        // this is not hiding the play options as it shouls when a blackjack is scored by the player
        // hidePlayOptionButtons();// no play option buttons needed, player wins with a blackjack
        // trying to hard-code hiding
        handIsBlackjack();
        updateWinnerDisplay('player', true)
      }
    }else if(nowIsTheTurnOf === 'dealer'){
      /*===========================================================================*/
      // HERE WE CALCULATE THE HAND OF THE DEALER
      // (MEMO: NEEDS TO BE REFACTORED TO USE SAME FUNCTION FOR BOTH CALCULATIONS)
      /*===========================================================================*/
      dealerCardsToDisplay =[];//clearing to prevent duplicates when calling again the function
      var numberOfCardsDealtToDelaer = dealerHandArray.length;
      console.log(dealerHandArray);
      console.log('The dealer has been dealt ' + numberOfCardsDealtToDelaer + ' cards');
      var calculatingDealerHandArray = [];
      var cardFace = [];
      //Calculate player hand
      dealerHandArray.map(function(element) {
        //console.log(element);
        calculatingDealerHandArray.push(element[2]);
        cardFace.push(element[0]);
        cardFace.push(element[1]);
        var cardNameForSVG = cardFace.toString();
        var removeComma = /\,/gi;
        cardNameForSVG = cardNameForSVG.replace(removeComma, '');
        dealerCardsToDisplay.push(cardNameForSVG);
        // We clear the variable to get it ready for the Nth element in the map
        // if not cleared the 2nd card name will contain the 1st one, the 3rd would contain 1st, 2nd and 3rd... and so on
        cardNameForSVG="";
        cardFace=[];
        // we sort the array to put all the aces at the end so we can count them to determine when they should count as 11 or 1
        calculatingDealerHandArray = calculatingDealerHandArray.sort(function(a, b) {
          return b - a;
        });
      })

      // we render the card for for the dealer's hand
      renderDealtCards(dealerCardsToDisplay, 'dealer');

      console.log('sorted array: ' + calculatingDealerHandArray)

      var cardsSum = 0;//Reset each time we start calculating (We can use the same var name we used for the player as it always gets reset)
      for (i = 0; i < calculatingDealerHandArray.length; i++) {

        if (calculatingDealerHandArray[i] === 1) {// if we find an ace, which we get as default value of 1 in the sorted array...
          //(sum is reset on each calculation)
          var sum = cardsSum + 11 + (calculatingDealerHandArray.length - (i + 1));
          console.log('the sum is:'+ sum);
          if (sum > 21) {// if there are aces and the sum of the card will exceed 21 if we count them as 11 points
            cardsSum += 1 // count the ace/s as 1 point
          }else if(sum <= 21) {// if there is an ace and the sum is less than or equal to 21
            cardsSum = calculatingDealerHandArray[i] + 11 // we count that ace as 11 points
          }
        // if no aces are found in the sorted array
      } else {// we just add the value of all cards together
          cardsSum += calculatingDealerHandArray[i];
        }
      }
      console.log('=====> '+dealerHandArray.length);
      // Once we have the current sum of the cards in the current hand, we update the points display
      var firstDealerCard = dealerHandArray[0][3] ;
      if (playerIsDonePlayingForThisRound){
          $('#dealer-hand-display-points>div').text(cardsSum);// Show the points of the full hand when player chose to stand
      }else{
        $('#dealer-hand-display-points>div').text(cardsSum-firstDealerCard);// show the points of visible card only during player's turn
      }
      console.log(' Dealer Total = ' + cardsSum);
      console.log(cardFace);

      // // we check to see if the player has blackjack or went over 21 and busted
      if (cardsSum === 21) {
        hidePlayOptionButtons(); // no playing option needed, dealer wins
        revealDealerHiddenCard(); // we show the card and update the point display
        $('#dealer-hand-display-points>div').text(cardsSum);// Show the points of the full hand when player chose to stand
        updateWinnerDisplay('dealer', true);
        handIsBlackjack(); // we trigger the blackjack message
      }
    }
  }// end of calculateHand


  /*======================================*/
  /*  RENDERING PLAYER AND DEALER CARDS   */
  /*======================================*/
  var renderDealtCards = function(cardsArrayForRendering, whoIsPlaying){
    console.log('cards to render: '+cardsArrayForRendering+' number of cards: '+cardsArrayForRendering.length);

    if (whoIsPlaying === 'player') {
      var elementIdPrefix ='pl';
      var className = whoIsPlaying+'-card';
    }else if (whoIsPlaying === 'dealer'){
      var elementIdPrefix ='dc';
      var className = whoIsPlaying+'-card';
    }

    cardsArrayForRendering.forEach(function(element,index){
      //create divs with specific IDs, object loading the svg showing the corresponding card dealt
      var cardPlacementOffset= 50*(index+3);
      var cardsList = $('<li id="'+elementIdPrefix+(index+1)+'" class="'+className+'"></li>');

      // Dealer's 1st card not shown until the player will stand and will be the dealer's turn to play
      if(whoIsPlaying === 'dealer' && index === 0){
        //create an element to show the dealer's first card face down
        var cardsSVG = $('<img src="./images/cardReverseSide.jpg" width="150" height="210"/>')
      }else{
        var cardsSVG = $('<object type="image/svg+xml" data="./images/'+cardsArrayForRendering[index]+'.svg" width="150">Your browser does not support SVG</object>')
      }
      // append card if not displayed if the element with the current id exists, skip it... if it does not exist add it to the list
      if ($('#'+elementIdPrefix+(index+1)).length ===0 ){
        //console.log("+++++>> "+$('#'+elementIdPrefix+(index+1)).length);
        //console.log('cardPlacementOffset: '+cardPlacementOffset)
        $('#game-container').append(cardsList);
        $('#'+elementIdPrefix+(index+1)).append(cardsSVG);
        $('#'+elementIdPrefix+(index+1)).css({'left':cardPlacementOffset+'px'});
      }
    })
  }


  var revealDealerHiddenCard = function(){
    var firstDealerCardFaceUpSVG = $('<object type="image/svg+xml" data="./images/'+dealerCardsToDisplay[0]+'.svg" width="150">Your browser does not support SVG</object>')
    if ($('#dc1').length !== 0){
      $('#dc1 img').remove();// remove the face-down card
      $('#dc1').append(firstDealerCardFaceUpSVG);
    }
  }



  var handIsBlackjack = function() {
    $('#game-container').append('<div id=blackjack style="position:absolute; top:395px; left:420px;color:#FC0;"><h1>Blackjack!</h1></div>');
    hidePlayOptionButtons(); // since the round is won by player or dealer, no need for playing options buttons
    var removeBlackjackMessageTimeoutID = setTimeout(function(){//Keep the message visible for 2 sec. then removed it
      $('#blackjack').remove();
    },5000);
    // Collect winnings (player or dealer): Update the player balance display, then reset to start a new round
    //@@@
  }

  var handIsBusted = function() {
    $('#game-container').append('<div id="busted" style="position:fixed; top:395px; left:445px;color:#FC0;"><h1>Busted!</h1></div>');
    hidePlayOptionButtons(); // since the round is won by player or dealer, no need for playing options buttons
    var removeBustedMessageTimeoutID = setTimeout(function(){//Keep the message visible for 2 sec. then removed it
      $('#busted').remove();
    },5000);
    // Collect winnings (player or dealer): Update the player balance display, then reset to start a new round
    //@@@
  }

  var hitPlayer = function() {
    dealHand('player'); // we deal one card to the player
    calculateHand('player'); // we calculate the value of the player's hand after adding the newly dealt card
    var playerCurrentHandValue = $('#player-hand-display-points>div').text();
    console.log('playerCurrentHandValue: '+playerCurrentHandValue);
    if (playerCurrentHandValue === 21){//blackjack!
      hidePlayOptionButtons();
      updateWinnerDisplay('player', true);
      handIsBlackjack();
    }else if(playerCurrentHandValue >21){
      hidePlayOptionButtons();
      updateWinnerDisplay('dealer', false);
      handIsBusted();
    }
  }

  // Update winner display and player balance (if player won round)
  var updateWinnerDisplay = function (theWinner, pointWasBlackJack){
    $('#round-winner').text(theWinner+' wins');
    // if winner is dealer we removed confirmed bet (cash-in) and leave the player-balance-display unchanged
    if (theWinner === 'dealer'){
      $('#placed-bet-display').remove();
    }else if (theWinner === 'player' && !pointWasBlackJack) {
      playerBalance += (playerBet + playerBet);//pays 1:1 on regular wins, bet 10 get your 10 back + 10 from the house
    }else if (theWinner === 'player' && pointWasBlackJack) {
      playerBalance += (playerBet+(playerBet* 1.5));//pays 3:2 on blackjack wins, bet 10 get your 10 back + 15 from the house
    }
  }


/*#########################################*/
/*  DEALER'S TURN. PLAYING TO BEAT PLAYER  */
/*#########################################*/

  var checkWinner = function(){
    var dealerHandCurrentValue = $('#dealer-hand-display-points>div').text();
    var playerHandToBeat = $('#player-hand-display-points>div').text();
    // Did the dealer score a blackjack? If so dealer wins!
    if (dealerHandCurrentValue === 21){
      // dealer wins if got blackjack
      roundWinner = 'dealer';
      updateWinnerDisplay(roundWinner, false);
      revealDealerHiddenCard();
      handIsBlackjack();
    }else if(dealerHandCurrentValue > playerHandToBeat){
      // dealer wins when getting a hand that is not >21 and is higher than the one the player had when choosing to stand
      roundWinner = 'dealer';
      updateWinnerDisplay(roundWinner, false);
    }else if (dealerHandCurrentValue > 21){
      // Player wins if dealer busted
      roundWinner = 'player';
      updateWinnerDisplay(roundWinner, false);
      handIsBusted();
    }else if (dealerHandCurrentValue > 17 && playerHandToBeat > dealerHandCurrentValue) {
      // player wins if after reaching 17 or over, the player hand is higher (dealer must stand on 17)
      roundWinner = 'player';
      updateWinnerDisplay(roundWinner, false);
    }else if (dealerHandCurrentValue === playerHandToBeat){
      //player wins on tie
      roundWinner = 'player';
      updateWinnerDisplay(roundWinner, false);
    }else if(dealerHandCurrentValue < playerHandToBeat){
      roundWinner = 'player';
      updateWinnerDisplay(roundWinner, false);
    }

    console.log('Dealer must beat: '+playerHandToBeat+' has: '+dealerHandCurrentValue);
    console.log(dealerHandArray,dealerCardsToDisplay);
    console.log(roundWinner);
  }


  var playerStand = function (){
    // we remove the play options button from the UI as they are no longer needed for the dealer's turn
    hidePlayOptionButtons();
    // Flag used in the calculateHand function to show the total of the dealer's hand once it will be the dealer's turn
    // Before that, it's set to false to show only the value of the card facing up.
    playerIsDonePlayingForThisRound = true;
    var playerHandToBeat = $('#player-hand-display-points>div').text();

    // - Once it's the dealer's turn, first we reveal the dealer's hidden card flipping it face up,
    revealDealerHiddenCard();
    // - then we also update the display showing the total of the dealer's to include the card that was just revealed.
    calculateHand('dealer');// we get the updated value showing both cards
    var dealerHandCurrentValue = $('#dealer-hand-display-points>div').text();

    // now is the turn of the dealer to start playing and beat points of the hand held by the player.
    // if dealer's hand is lower than the player's AND the total of the dealer's hand is less than 17
    if (dealerHandCurrentValue > playerHandToBeat){
      checkWinner();
    }else{
      while (dealerHandCurrentValue < 17 && dealerHandCurrentValue < playerHandToBeat){
        dealHand('dealer');// Draw a card from the deck
        calculateHand('dealer');
        dealerHandCurrentValue = $('#dealer-hand-display-points>div').text();
        console.log('dealerHandCurrentValue is: '+dealerHandCurrentValue);
      }
      checkWinner();
    }
    //alert('!!!')
    // keep dealing cards until the delaer's hand points are higher than the player's, OR
    // lose due to the on must stand ono 17 as dealer can't draw more cards after raching 17 (or higher),
    // OR bust trying to win


    // upon dealer delaer winning, losing or busting, we'll update the player balance.
    // Blackjack wins 1.5:1 (or 3 to 2) other bets win 1:1
    // Note that the dealer during his turn must stand on 17. This means that when drawing a card and his hand is still
    // less than the player's, the player will win as the dealer must stand and can't draw additional cards.

  }


  var initGame = function (){
    // show the initial amount for the player balance in the player balance display (would be 2000 when staring a brand new game)
    updatePlayerBalanceDisplay(playerBalance);
    // hide the hit and stand buttons until as the player needs to place a bet first
    hidePlayOptionButtons();
    // Show message asking to place a minimum bet to start game. This will be removed when bet gets confirmed
    var minBetMessage = $('<div id="min-bet-message" style="position:fixed; top:0; left:270px; text-align:center;">Minimum bet amount is $10. Please place your bet to start.</div>');
    $('body').append(minBetMessage);
  }

  initGame();



}); //-- End of jQuery Closure
