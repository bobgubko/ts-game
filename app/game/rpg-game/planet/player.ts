import { Vector2 } from '../../../engine/math/vector2';
import { renderer } from '../../../engine/render/webgl';
import { Sprite } from '../../../engine/scene/sprite';
import { Text } from '../../../engine/scene/text';
import { GLOBAL } from '../global';
import { PlayerData } from '../player-data';
import { IRenderable } from '../render-helper';
import { HealthBar } from './health-bar';
import { Inventory } from './inventory';
import { PlayerStatsRow } from './player-stats-row';
import { ShipCell } from './ship-cell';

export class Player implements IRenderable {

  static build(playerData: PlayerData): Player {
    const player = new Player();

    player.playerData = playerData;

    const playerW = 400;

    player.background = new Sprite(playerW, renderer.height - 80, new Vector2(0, 0));
    player.background.position.set(10, 70, 1);
    player.background.setVerticesColor(52 / 255, 111 / 255, 149 / 255, 1.0);
    const region = GLOBAL.assets.planetAtlas.getRegion('blank.png');
    player.background.setTextureRegion(region, false);

    const start = 340;
    player.playerStats.push(
      new PlayerStatsRow('Урон (сумм)', `${playerData.attackDamageMin * playerData.attackCount}–${playerData.attackDamageMax * playerData.attackCount}`, 10, start),
      new PlayerStatsRow('Щит', `${playerData.protectCount} x ${playerData.protectMultiplier * 100} %`, 10, start + 25),
      new PlayerStatsRow('Крит. шанс', `${playerData.criticalChance * 100} %`, 10, start + 50),
      new PlayerStatsRow('Крит. урон', `200 %`, 10, start + 75),
    );

    for (const stat of player.playerStats) {
      stat.caption.parent = player.background;
    }

    player.shipCells.push(
      new ShipCell(150, 140),
      new ShipCell(250, 140),
      new ShipCell(100, 240),
      new ShipCell(300, 240),
      new ShipCell(200, 265),
    );

    player.health = new HealthBar(20, 630);
    player.updateHealth();

    player.inventory  = new Inventory(playerData.inventorySize, playerData.inventory, 480, 150);

    player.inventoryCaption = new Text('Инвентарь');
    player.inventoryCaption.position.set(450, 70, 2);
    player.inventoryCaption.color.set(1, 1, 1, 1);
    player.inventoryCaption.pivotPoint.set(0, 0);
    player.inventoryCaption.scale = 1.3;

    player.creditsText = new Text('$---');
    player.creditsText.position.set(920, 70, 2);
    player.creditsText.color.set(1, 1, 1, 1);
    player.creditsText.pivotPoint.set(1, 0);
    player.creditsText.scale = 1.3;

    player.updateCreditsText();

    return player;
  }

  background: Sprite;
  playerStats: PlayerStatsRow[] = [];
  shipCells: ShipCell[] = [];
  health: HealthBar;
  inventory: Inventory;
  inventoryCaption: Text;
  creditsText: Text;

  playerData: PlayerData;

  updateHealth(): void {
    this.health.updateHealth(this.playerData.shipHealth, this.playerData.shipMaxHealth);
  }

  updateCreditsText(): void {
    this.creditsText.text = `$${this.playerData.credits}`;
  }

  getSpritesToRender(): Sprite[] {
    const result: Sprite[] = [this.background, this.health.back, this.health.current];
    for (const cell of this.shipCells) {
      result.push(cell.cellSprite);
    }

    return result.concat(this.inventory.getSpritesToRender());
  }

  getTextsToRender(): Text[] {
    const result: Text[] = [this.inventoryCaption, this.creditsText];

    for (const stat of this.playerStats) {
      result.push(stat.caption, stat.value);
    }

    return result.concat(this.inventory.getTextsToRender());
  }
}
