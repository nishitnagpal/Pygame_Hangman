import pygame
import time
import random

pygame.font.init()

WIDTH, HEIGHT = 1000, 600
WIN = pygame.display.set_mode((WIDTH, HEIGHT))  
pygame.display.set_caption("HANGMAN")

FONT = pygame.font.SysFont("comicsans", 20)

WORD_WIDTH = 100
WORD_HEIGHT = 10
#WORD_LENGTH = 5
SPACING = 50
MAX_ATTEMPTS = 6

input_char = ""
input_history = []
attempts = 0

def load_words(filename):
    with open(filename, 'r') as file:
        words = file.read().splitlines()
    return [word.upper() for word in words if len(word) == 5]

WORDS_LIST = load_words('five_letter_words.txt')

def draw_game(dashes, elapsed_time):
    
    global game_started, win_message, end_message, input_char, guessed_letters, attempts, input_history, final_time, WORD

    WIN.fill("black")
    
    if game_started:
        for i, dash in enumerate(dashes):
            pygame.draw.rect(WIN, "white", dash)
            if guessed_letters[i]:
                letter_text = FONT.render(guessed_letters[i], 1, "white")
                WIN.blit(letter_text, (dash.x + (WORD_WIDTH - letter_text.get_width()) // 2, dash.y - 30))
                
        
    time_text = FONT.render(f"Time: {round(elapsed_time)}s", 1, "orange")
    WIN.blit(time_text, (10, 10))
    
    if game_started:
        input_display = FONT.render(f"Letters Tried: {''.join(input_history)}", 1, "white")
        WIN.blit(input_display, (250, 100))

    attempts_text = FONT.render(f"Attempts: {attempts}/{MAX_ATTEMPTS}", 1, "orange")
    WIN.blit(attempts_text, (WIDTH - 150, 10))

    if not game_started and not end_message and not win_message:
        start_text = "Press Enter to Play\n\n Guess the word in SIX tries\n\n Enter a letter in each try \n\n Press q to Quit"
        text_rect = pygame.Rect(0, 0, WIDTH, HEIGHT)
        draw_multiline_text(WIN, start_text, FONT, "white", text_rect)
    
    if not game_started and win_message:
        win_text = f"You Won!\n Time Taken: {round(final_time)}s \n\n Press Enter to Play Again or q to Quit"  
        text_rect = pygame.Rect(0, 0, WIDTH, HEIGHT)
        draw_multiline_text(WIN, win_text, FONT, "green", text_rect)
    
    if not game_started and end_message:
        lost_text = f"The word was: {WORD} \n\n Game Over! \n\n You've exceeded the maximum attempts! \n\n Press Enter to Play Again or q to Quit"
        text_rect = pygame.Rect(0, 0, WIDTH, HEIGHT)
        draw_multiline_text(WIN, lost_text, FONT, "red", text_rect)

    pygame.display.update()

def draw_multiline_text(surface, text, font, color, rect):
    lines = text.splitlines()
    y = rect.y
    for line in lines:
        rendered_text = font.render(line, True, color)
        surface.blit(rendered_text, (rect.x + (rect.width - rendered_text.get_width()) / 2, y + (HEIGHT/3 + rendered_text.get_height())))
        y += rendered_text.get_height()

def reset_game():
    
    global game_started, win_message, end_message, dashes, start_time, elapsed_time, final_time, input_char, guessed_letters, attempts, input_history, WORD, word_letters

    game_started = False
    end_message = False
    win_message = False
    start_time = time.time()
    elapsed_time = 0
    final_time = 0
    input_char = ""
    input_history = []
    attempts = 0
    #start_time = 0

    WORD = random.choice(WORDS_LIST)
    print(WORD)
    word_letters = list(WORD)
    guessed_letters = [""] * len(WORD)

    dashes = []
    total_dash_width = len(WORD) * WORD_WIDTH + (len(WORD) - 1) * SPACING
    start_x = (WIDTH - total_dash_width) / 2

    for i in range(len(WORD)):
        dash_x = start_x + i * (WORD_WIDTH + SPACING)
        dash = pygame.Rect(dash_x, HEIGHT / 2, WORD_WIDTH, WORD_HEIGHT)
        dashes.append(dash)

def handle_input(event):
    global input_char, guessed_letters, attempts, input_history, win_message, final_time, game_started
    
    if event.key == pygame.K_BACKSPACE:
        input_char = input_char[:-1]
    elif event.unicode.isalpha() and len(input_char) < 1:
        input_text = event.unicode.upper()
        #Ignore the input if the letter has already been guessed
        if input_text in input_history:
            return
        input_history.append(input_text)
        input_char = input_text
        
        if input_text in word_letters:
            for i, letter in enumerate(word_letters):
                if letter == input_text:
                    guessed_letters[i] = input_text
            if guessed_letters == word_letters:
                win_message = True
                final_time = time.time() - start_time
                game_started = False
        else:
            attempts += 1
        input_char = ""

def main():
    global game_started, win_message, end_message, start_time, elapsed_time

    clock = pygame.time.Clock()
    reset_game()    
    run = True
    while run:
        clock.tick(60)
        
        if game_started:
            elapsed_time = time.time() - start_time
        
        if attempts >= MAX_ATTEMPTS:
                game_started = False
                end_message = True

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    if not game_started:
                        game_started = True
                        start_time = time.time() 
                    if end_message or win_message:  
                        reset_game()
                elif event.key == pygame.K_q:
                    run = False
                elif game_started and not win_message:
                    handle_input(event)    

        draw_game(dashes, elapsed_time)
    
    pygame.quit()

# Run the game
if __name__ == "__main__":
    main()