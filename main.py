import time, random, torch
import numpy as np
from typing import Optional
from pydantic import BaseModel
from fastapi import FastAPI
from collections import deque
from qnet import Linear_QNet, QTrainer
from helper import plot

MAX_MEMORY = 100_000
BATCH_SIZE = 1000
LR = 0.001

n_games = 0
epsilon = 0 # randomness
gamma = 0.9 # discount rate
memory = deque(maxlen=MAX_MEMORY) # popleft()
model = Linear_QNet(11, 256, 3)
trained_model = Linear_QNet(11, 256, 3)
trained_model.load_state_dict(torch.load("model/trained_model.pth"))
trainer = QTrainer(model, lr=LR, gamma=gamma)

def remember(state, action, reward, next_state, done):
        memory.append((state, action, reward, next_state, done))


def train_long_memory():
    if len(memory) > BATCH_SIZE:
        mini_sample = random.sample(memory, BATCH_SIZE) # list of tuples
    else:
        mini_sample = memory

    states, actions, rewards, next_states, dones = zip(*mini_sample)
    trainer.train_step(states, actions, rewards, next_states, dones)
    #for state, action, reward, nexrt_state, done in mini_sample:
    #    self.trainer.train_step(state, action, reward, next_state, done)

def train_short_memory(state, action, reward, next_state, done):
        trainer.train_step(state, action, reward, next_state, done)

def get_action(state):
    # random moves: tradeoff exploration / exploitation
    epsilon = 300 - n_games
    final_move = [0,0,0]
    if random.randint(0, 750) < epsilon:
        move = random.randint(0, 2)
        final_move[move] = 1
    else:
        state0 = torch.tensor(state, dtype=torch.float)
        prediction = model(state0)
        move = torch.argmax(prediction).item()
        final_move[move] = 1

    return final_move


class HillClimbing(BaseModel):
    reward: int
    score: int
    state: list
    done: bool


plot_scores = []
plot_mean_scores = []
total_score = 0
record = 0

state_old = None
final_move = None


app = FastAPI()

@app.post("/play")
async def create_item(data: HillClimbing):

    print(data)

    final_move = [0,0,0]
    state0 = torch.tensor(data.state, dtype=torch.float)
    prediction = trained_model(state0)
    move = torch.argmax(prediction).item()
    final_move[move] = 1

    return {"move": final_move}


@app.post("/make_move")
async def create_item(data: HillClimbing):
    global state_old, final_move

    print(data)

    state_old = np.array(data.state)
    final_move = get_action(state_old)

    return {"move": final_move}


@app.post("/train")
async def create_item(data: HillClimbing):
    global n_games, record, total_score

    print(data)

    state_new = np.array(data.state)


    train_short_memory(state_old, final_move, data.reward, state_new, data.done)
    remember(state_old, final_move, data.reward, state_new, data.done)

    if data.done:
        # train long memory, plot result
        n_games += 1
        train_long_memory()

        if data.score > record:
            record = data.score
            model.save()

        print('Game', n_games, 'Score', data.score, 'Record:', record)

        plot_scores.append(data.score)
        total_score += data.score
        mean_score = total_score / n_games
        plot_mean_scores.append(mean_score)
        plot(plot_scores, plot_mean_scores)

    return
