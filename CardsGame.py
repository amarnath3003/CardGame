import random



# Full Deck: [Weight, Suit_ID]
deck = [
    # Clubs (ID: 0)
    [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0],
    
    # Diamonds (ID: 1)
    [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1],
    
    # Hearts (ID: 2)
    [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2],
    
    # Spades (ID: 3)
    [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [13, 3], [14, 3]
]

Player1 = []
Player2 = []
Player3 = []
Player4 = []

def shuffle_deck(deck):
    for i in range(len(deck)//4):
        Player1.append(deck.pop(random.randint(0, len(deck)-1)))
        Player2.append(deck.pop(random.randint(0, len(deck)-1)))
        Player3.append(deck.pop(random.randint(0, len(deck)-1)))
        Player4.append(deck.pop(random.randint(0, len(deck)-1)))
    print(Player1,"\n",Player2,"\n",Player3,"\n",Player4)
        
    return deck

shuffle_deck(deck)

hands = [Player1, Player2, Player3, Player4]

def find_lead(hands):
    for player in hands:
        for card in player:
            if card[0] == 14 and card[1] == 3:
                lead = player  # Ace of Spades
                aceposition = player.index(card)  # Position of the Ace of Spades in the player's hand
                return hands.index(lead),aceposition # Return the index of the player with the lead card
            
print("lead: Player ", find_lead(hands))


def middeck(hands,lead_index,aceposition):
    middeck = []
    print("Player ", lead_index, " can add Ace Spade (14,3) to middeck")
    middeck.append({
    "player": lead_index,
    "card": hands[lead_index].pop(aceposition)})
    print("Middeck: ", middeck)  # Assuming ChosenCardIndex is defined elsewhere
    return middeck

lead_info = find_lead(hands)
if lead_info is not None:
    middeck_result = middeck(hands, lead_info[0], lead_info[1])
    required_suit = middeck_result[0]['card'][1]
    print("Required Suit: ", required_suit)

def player_rotation(current_player):
    next_player_index = (current_player + 1) % 4
    return next_player_index


def play_card(player, middeck, required_suit, hands):

    # Check if player has required suit
    for i, card in enumerate(player):

        # Normal play
        if card[1] == required_suit:

            played_card = player.pop(i)

            middeck.append({
                "player": hands.index(player),
                "card": played_card
            })

            print("Player", hands.index(player), "plays:", played_card)

            return {
                "cut": False,
                "played_card": played_card
            }

    # CUT condition
    played_card = player.pop(0)

    middeck.append({
        "player": hands.index(player),
        "card": played_card
    })

    print("Player", hands.index(player),
          "CUTS with:", played_card)

    return {
        "cut": True,
        "played_card": played_card
    }