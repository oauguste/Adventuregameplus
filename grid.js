import { GridObject } from "./gridObject.js";
import { Player } from "./player.js";
import { enemyObject } from "./enemyObject.js";
import { itemObject } from "./itemObject.js";
import { promptPlayerForDirection } from "./playerPrompt.js";

class Grid {
  #currentObject;
  constructor(
    width,
    height,
    playerStartX = 0,
    playerStartY = height - 1
  ) {
    this.width = width;
    this.height = height;
    this.playerX = playerStartX;
    this.playerY = playerStartY;
    this.player = new Player("Cat King", {
      attack: 10,
      defense: 10,
      hp: 20,
    });

    // create the grid
    this.grid = [];
    for (let row = 0; row < height; row++) {
      let thisRow = [];
      for (let col = 0; col < width; col++) {
        thisRow.push(new GridObject());
      }
      this.grid.push(thisRow);
    }
    //player is in the bottom left
    this.grid[height - 1][0] = new GridObject(
      "🐱",
      "player"
    );
    //goal
    this.grid[0][width - 1] = new GridObject("⭐", "win");
    this.startGame();
  }
  async startGame() {
    while (this.player.getStats().hp > 0) {
      this.displayGrid();
      const response = await promptPlayerForDirection();
      switch (response) {
        case "Up": {
          this.movePlayerUp();
          break;
        }
        case "Down": {
          this.movePlayerDown();
          break;
        }
        case "Left": {
          this.movePlayerLeft();
          break;
        }
        case "Right": {
          this.movePlayerRight();
          break;
        }
      }

      console.log(
        "----------------------------------------"
      );
    }
  }
  displayGrid() {
    this.player.describe();
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        process.stdout.write(this.grid[row][col].sprite);
        process.stdout.write("\t");
      }
      process.stdout.write("\n");
    }
  }

  generateGridObject() {
    const random = Math.random();
    let object;

    if (random < 0.15) {
      object = new itemObject("⚔", {
        name: "sword",
        attack: 3,
        defense: 1,
        hp: 0,
      });
    } else if (random < 0.35) {
      object = new enemyObject("🕷", {
        name: "spider",
        attack: 15,
        defense: 1,
        hp: 6,
      });
    } else {
      object = new GridObject("🐾", "discovered");
    }
    return object;
  }
  executeTurn() {
    if (
      this.grid[this.playerY][this.playerX].type === "win"
    ) {
      console.log(
        `🎉🎊🎉 Congrats! You reached the end of the Game`
      );
      process.exit(); //exit our entire program
    }
    if (this.#currentObject.type === "discovered") {
      this.#currentObject.describe();
      return;
    }
    if (this.#currentObject.type === "item") {
      this.#currentObject.describe();
      const itemStats = this.#currentObject.getStats();
      this.player.addToStats(itemStats);
      return;
    }
    this.#currentObject.describe();
    const enemyStats = this.#currentObject.getStats();
    const enemyName = this.#currentObject.getName();
    const playerStats = this.player.getStats();
    if (enemyStats.defense > playerStats.attack) {
      console.log(
        `You Lose -  ${enemyName} was too powerful`
      );
      process.exit();
    }
    let totalPlayerDamage = 0;
    while (enemyStats.hp > 0) {
      const enemyDamageTurn =
        playerStats.attack - enemyStats.defense;
      const playerDamageTurn =
        enemyStats.attack - playerStats.defense;
      if (enemyDamageTurn > 0) {
        enemyStats.hp -= enemyDamageTurn;
      }
      if (playerDamageTurn > 0) {
        playerStats.hp -= playerDamageTurn;
        totalPlayerDamage += playerDamageTurn;
      }
    }
    if (playerStats.hp <= 0) {
      console.log(
        `You Lose - ${enemyName} was too poweful`
      );
    }
    this.player.addToStats({ hp: -totalPlayerDamage });
    console.log(
      `You defeated ${enemyName}! Your updated stats:`
    );
    this.player.describe();
  }
  movePlayerRight() {
    //check is on right edge of map
    if (this.playerX === this.width - 1) {
      console.log("Cannot Move Right");
      return;
    }
    //set our current spot to be discovered
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐾",
      "discovered"
    );
    // move the player to the right
    this.playerX += 1;
    // check if were moving to has been discoveree
    if (
      this.grid[this.playerY][this.playerX].type ===
      "discovered"
    ) {
      this.grid[this.playerY][this.playerY].describe();
      this.grid[this.playerY][this.playerX] =
        new GridObject("🐱");
      return;
    }
    // discovering a new place
    this.#currentObject = this.generateGridObject();
    this.executeTurn(); // generation
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐱"
    );
  }
  movePlayerLeft() {
    //check is on left edge of map
    if (this.playerX === 0) {
      console.log("Cannot Move Left");
      return;
    }
    //set our current spot to be discovered
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐾",
      "discovered"
    );
    // move the player to the left
    this.playerX -= 1;
    // check if were moving to has been discoveree
    if (
      this.grid[this.playerY][this.playerX].type ===
      "discovered"
    ) {
      this.grid[this.playerY][this.playerY].describe();
      this.grid[this.playerY][this.playerX] =
        new GridObject("🐱");
      return;
    }
    // discovering a new place
    // this.#currentObject = new GridObject("") // generation
    this.#currentObject = this.generateGridObject();
    this.executeTurn();
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐱"
    );
  }

  movePlayerUp() {
    //check is on Upper edge of map
    if (this.playerY === 0) {
      console.log("Cannot Move Up");
      return;
    }
    //set our current spot to be discovered
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐾",
      "discovered"
    );
    // move the player to the Up
    this.playerY -= 1;
    // check if were moving to has been discoveree
    if (
      this.grid[this.playerY][this.playerX].type ===
      "discovered"
    ) {
      this.grid[this.playerY][this.playerY].describe();
      this.grid[this.playerY][this.playerX] =
        new GridObject("🐱");
      return;
    }
    // discovering a new place
    // this.#currentObject = new GridObject("") // generation
    this.#currentObject = this.generateGridObject();
    this.executeTurn();
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐱"
    );
  }
  movePlayerDown() {
    //check is on Bottom edge of map
    if (this.playerY === this.height - 1) {
      console.log("Cannot Move Down");
      return;
    }
    //set our current spot to be discovered
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐾",
      "discovered"
    );
    // move the player to the Up
    this.playerY += 1;
    // check if were moving to has been discoveree
    if (
      this.grid[this.playerY][this.playerX].type ===
      "discovered"
    ) {
      this.grid[this.playerY][this.playerY].describe();
      this.grid[this.playerY][this.playerX] =
        new GridObject("🐱");
      return;
    }
    // discovering a new place
    // this.#currentObject = new GridObject("") // generation
    this.#currentObject = this.generateGridObject();
    this.executeTurn();
    this.grid[this.playerY][this.playerX] = new GridObject(
      "🐱"
    );
  }
}

new Grid(7, 7);
