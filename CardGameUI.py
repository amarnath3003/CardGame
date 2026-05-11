import pygame
import random
import sys
from enum import Enum
from dataclasses import dataclass
from typing import List, Tuple

# Initialize Pygame
pygame.init()

# Constants
WINDOW_WIDTH = 1400
WINDOW_HEIGHT = 900
CARD_WIDTH = 70
CARD_HEIGHT = 100
FPS = 60

# Colors
GREEN_TABLE = (34, 139, 34)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)
BLUE = (0, 0, 255)
GRAY = (128, 128, 128)
GOLD = (255, 215, 0)

# Card Suits
SUIT_SYMBOLS = {'s': '♠', 'c': '♣', 'h': '♥', 'd': '♦'}
SUIT_COLORS = {'s': BLACK, 'c': BLACK, 'h': RED, 'd': RED}

class GameState(Enum):
    PLAYING = 1
    ROUND_OVER = 2
    GAME_OVER = 3

@dataclass
class Card:
    value: str
    
    def get_rank(self) -> str:
        return self.value[:-1]
    
    def get_suit(self) -> str:
        return self.value[-1]

class CardGameUI:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Card Game - 4 Players")
        self.clock = pygame.time.Clock()
        self.font_large = pygame.font.Font(None, 48)
        self.font_medium = pygame.font.Font(None, 32)
        self.font_small = pygame.font.Font(None, 24)
        self.font_tiny = pygame.font.Font(None, 18)
        
        # Game state
        self.card_rank_priority = {
            'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10,
            '9': 9, '8': 8, '7': 7, '6': 6, '5': 5,
            '4': 4, '3': 3, '2': 2
        }
        
        self.all_cards = [
            "As","2s","3s","4s","5s","6s","7s","8s","9s","10s","Ks","Qs","Js",
            "Ac","2c","3c","4c","5c","6c","7c","8c","9c","10c","Kc","Qc","Jc",
            "Ah","2h","3h","4h","5h","6h","7h","8h","9h","10h","Kh","Qh","Jh",
            "Ad","2d","3d","4d","5d","6d","7d","8d","9d","10d","Kd","Qd","Jd"
        ]
        
        self.init_game()
    
    def init_game(self):
        """Initialize a new game"""
        self.player_hands = [[], [], [], []]
        self.middle_deck = []
        self.garbage_deck = []
        self.current_player = 0
        self.turn_counter = 0
        self.game_state = GameState.PLAYING
        self.selected_card_idx = None
        self.round_winner = None
        self.highest_card = None
        self.player_names = ["You", "Player 2", "Player 3", "Player 4"]
        
        # Deal cards
        self.deal_cards()
    
    def deal_cards(self):
        """Deal initial 13 cards to each player"""
        available_cards = self.all_cards.copy()
        
        for _ in range(13):
            for player in range(4):
                card = random.choice(available_cards)
                self.player_hands[player].append(card)
                available_cards.remove(card)
        
        # Start with Ace of Spades
        for player in range(4):
            if "As" in self.player_hands[player]:
                self.middle_deck.append("As")
                self.player_hands[player].remove("As")
                self.current_player = (player + 1) % 4
                break
    
    def get_card_priority(self, card: str) -> int:
        """Get priority of a card"""
        rank = card[:-1]
        return self.card_rank_priority.get(rank, 0)
    
    def handle_card_click(self, pos: Tuple[int, int]):
        """Handle clicking on a card"""
        if self.game_state != GameState.PLAYING or self.current_player != 0:
            return
        
        # Check if click is on player cards
        card_positions = self.get_player_card_positions(0)
        for idx, (card_rect, card) in enumerate(card_positions):
            if card_rect.collidepoint(pos):
                self.selected_card_idx = idx
                break
    
    def place_card(self):
        """Place selected card in middle"""
        if self.selected_card_idx is None or self.current_player != 0:
            return
        
        card = self.player_hands[0][self.selected_card_idx]
        self.middle_deck.append(card)
        self.player_hands[0].pop(self.selected_card_idx)
        self.selected_card_idx = None
        self.turn_counter += 1
        
        # Move to next player
        self.current_player = (self.current_player + 1) % 4
        
        # Check if round is over
        if self.turn_counter == 4:
            self.end_round()
    
    def ai_play(self):
        """AI players play their turn"""
        if self.current_player == 0 or self.game_state != GameState.PLAYING:
            return False
        
        player_hand = self.player_hands[self.current_player]
        if player_hand:
            card = random.choice(player_hand)
            self.middle_deck.append(card)
            player_hand.remove(card)
            self.turn_counter += 1
            self.current_player = (self.current_player + 1) % 4
            
            if self.turn_counter == 4:
                self.end_round()
            return True
        return False
    
    def end_round(self):
        """End current round and determine winner"""
        self.game_state = GameState.ROUND_OVER
        
        # Find highest priority card
        max_priority = -1
        winner = -1
        highest_card = None
        
        for card in self.middle_deck:
            priority = self.get_card_priority(card)
            if priority > max_priority:
                max_priority = priority
                highest_card = card
                winner = self.middle_deck.index(card) % 4
        
        self.round_winner = winner
        self.highest_card = highest_card
        self.garbage_deck.extend(self.middle_deck)
        self.middle_deck.clear()
        self.turn_counter = 0
        
        # Add cards to loser
        loser_count = 0
        for i in range(4):
            if i != winner:
                self.player_hands[i].extend(random.sample(self.garbage_deck, min(5, len(self.garbage_deck))))
                loser_count += 1
        
        self.garbage_deck.clear()
    
    def restart_round(self):
        """Restart for next round"""
        self.game_state = GameState.PLAYING
        self.current_player = (self.round_winner + 1) % 4
        self.selected_card_idx = None
    
    def get_player_card_positions(self, player: int) -> List[Tuple]:
        """Get positions of cards for a player"""
        cards = self.player_hands[player]
        positions = []
        
        if player == 0:  # Bottom (current player)
            card_gap = 20
            total_width = len(cards) * CARD_WIDTH + (len(cards) - 1) * card_gap
            start_x = (WINDOW_WIDTH - total_width) // 2
            start_y = WINDOW_HEIGHT - CARD_HEIGHT - 40
            
            for idx, card in enumerate(cards):
                x = start_x + idx * (CARD_WIDTH + card_gap)
                y = start_y
                rect = pygame.Rect(x, y, CARD_WIDTH, CARD_HEIGHT)
                positions.append((rect, card))
        
        elif player == 1:  # Top (opponent)
            card_gap = 12
            total_width = len(cards) * 40 + (len(cards) - 1) * card_gap
            start_x = (WINDOW_WIDTH - total_width) // 2
            start_y = 30
            
            for idx, card in enumerate(cards):
                x = start_x + idx * (40 + card_gap)
                y = start_y
                rect = pygame.Rect(x, y, 40, 60)
                positions.append((rect, card))
        
        elif player == 2:  # Left
            card_gap = 12
            start_x = 30
            start_y = (WINDOW_HEIGHT - len(cards) * (40 + card_gap)) // 2
            
            for idx, card in enumerate(cards):
                x = start_x
                y = start_y + idx * (40 + card_gap)
                rect = pygame.Rect(x, y, 40, 60)
                positions.append((rect, card))
        
        elif player == 3:  # Right
            card_gap = 12
            start_x = WINDOW_WIDTH - 70
            start_y = (WINDOW_HEIGHT - len(cards) * (40 + card_gap)) // 2
            
            for idx, card in enumerate(cards):
                x = start_x
                y = start_y + idx * (40 + card_gap)
                rect = pygame.Rect(x, y, 40, 60)
                positions.append((rect, card))
        
        return positions
    
    def draw_card(self, surface, card: str, x: int, y: int, width: int, height: int, show_value: bool = True):
        """Draw a card"""
        # Card background
        pygame.draw.rect(surface, WHITE, (x, y, width, height))
        pygame.draw.rect(surface, BLACK, (x, y, width, height), 2)
        
        if show_value:
            rank = card[:-1]
            suit = card[-1]
            suit_symbol = SUIT_SYMBOLS[suit]
            suit_color = SUIT_COLORS[suit]
            
            # Draw rank and suit
            rank_text = self.font_small.render(rank, True, suit_color)
            suit_text = self.font_small.render(suit_symbol, True, suit_color)
            
            surface.blit(rank_text, (x + 5, y + 5))
            surface.blit(suit_text, (x + width - 20, y + height - 25))
    
    def draw_card_back(self, surface, x: int, y: int, width: int, height: int):
        """Draw back of a card"""
        pygame.draw.rect(surface, BLUE, (x, y, width, height))
        pygame.draw.rect(surface, BLACK, (x, y, width, height), 2)
        pygame.draw.line(surface, WHITE, (x, y), (x + width, y + height), 1)
        pygame.draw.line(surface, WHITE, (x + width, y), (x, y + height), 1)
    
    def draw(self):
        """Draw everything"""
        self.screen.fill(GREEN_TABLE)
        
        # Draw player areas
        self.draw_player_area(0, "You (Bottom)")
        self.draw_player_area(1, "Player 2 (Top)")
        self.draw_player_area(2, "Player 3 (Left)")
        self.draw_player_area(3, "Player 4 (Right)")
        
        # Draw middle card stack
        self.draw_middle_deck()
        
        # Draw current turn indicator
        turn_text = self.font_medium.render(f"Turn: {self.player_names[self.current_player]}", True, GOLD)
        self.screen.blit(turn_text, (WINDOW_WIDTH // 2 - 100, 20))
        
        # Draw game state messages
        if self.game_state == GameState.ROUND_OVER:
            self.draw_round_over_screen()
        
        pygame.display.flip()
    
    def draw_player_area(self, player: int, name: str):
        """Draw player's cards"""
        positions = self.get_player_card_positions(player)
        
        for rect, card in positions:
            if player == 0:  # Current player sees cards
                is_selected = self.selected_card_idx == positions.index((rect, card))
                highlight = is_selected
                
                self.draw_card(self.screen, card, rect.x, rect.y, rect.width, rect.height)
                
                if highlight:
                    pygame.draw.rect(self.screen, YELLOW, (rect.x, rect.y, rect.width, rect.height), 4)
            else:  # Other players show card backs
                self.draw_card_back(self.screen, rect.x, rect.y, rect.width, rect.height)
                card_count = self.font_tiny.render(str(len(self.player_hands[player])), True, WHITE)
                self.screen.blit(card_count, (rect.x + rect.width // 2 - 5, rect.y + rect.height // 2 - 5))
    
    def draw_middle_deck(self):
        """Draw cards in middle"""
        middle_x = WINDOW_WIDTH // 2 - CARD_WIDTH // 2
        middle_y = WINDOW_HEIGHT // 2 - CARD_HEIGHT // 2
        
        # Draw last few cards stacked
        cards_to_show = self.middle_deck[-3:] if self.middle_deck else []
        
        for idx, card in enumerate(cards_to_show):
            offset = idx * 5
            self.draw_card(self.screen, card, 
                          middle_x + offset, middle_y + offset, 
                          CARD_WIDTH, CARD_HEIGHT)
        
        # Draw pile counter
        pile_text = self.font_medium.render(f"Pile: {len(self.middle_deck)}", True, WHITE)
        self.screen.blit(pile_text, (middle_x - 50, middle_y - 60))
    
    def draw_round_over_screen(self):
        """Draw round over screen"""
        # Semi-transparent overlay
        overlay = pygame.Surface((WINDOW_WIDTH, WINDOW_HEIGHT))
        overlay.set_alpha(200)
        overlay.fill(BLACK)
        self.screen.blit(overlay, (0, 0))
        
        # Winner text
        winner_text = self.font_large.render(f"{self.player_names[self.round_winner]} WINS!", True, GOLD)
        card_text = self.font_medium.render(f"Highest Card: {self.highest_card}", True, YELLOW)
        instructions = self.font_small.render("Click to continue to next round", True, WHITE)
        
        self.screen.blit(winner_text, (WINDOW_WIDTH // 2 - 150, WINDOW_HEIGHT // 2 - 100))
        self.screen.blit(card_text, (WINDOW_WIDTH // 2 - 120, WINDOW_HEIGHT // 2))
        self.screen.blit(instructions, (WINDOW_WIDTH // 2 - 120, WINDOW_HEIGHT // 2 + 100))
    
    def run(self):
        """Main game loop"""
        running = True
        ai_timer = 0
        
        while running:
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.MOUSEBUTTONDOWN:
                    if self.game_state == GameState.PLAYING:
                        self.handle_card_click(event.pos)
                    elif self.game_state == GameState.ROUND_OVER:
                        self.restart_round()
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_SPACE and self.current_player == 0:
                        self.place_card()
                    elif event.key == pygame.K_r:
                        self.init_game()
            
            # AI turn
            if self.game_state == GameState.PLAYING:
                ai_timer += 1
                if ai_timer > 30 and self.current_player != 0:  # 0.5 seconds delay
                    self.ai_play()
                    ai_timer = 0
            
            self.draw()
            self.clock.tick(FPS)
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = CardGameUI()
    game.run()