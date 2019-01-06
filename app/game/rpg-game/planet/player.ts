import { Vector2 } from '../../../engine/math/vector2';
import { renderer } from '../../../engine/render/webgl';
import { Sprite } from '../../../engine/scene/sprite';
import { Text } from '../../../engine/scene/text';
import { GLOBAL } from '../global';
import { PlayerData } from '../player-data';
import { IRenderable } from '../render-helper';
import { HealthBar } from './health-bar';
import { PlayerStatsRow } from './player-stats-row';
import { ShipCell } from './ship-cell';

export class Player implements IRenderable {

  static build(playerData: PlayerData): Player {
    const player = new Player();

    player.playerData = playerData;

    const playerW = 400;

    player.background = new Sprite(playerW, renderer.height - 20, new Vector2(0, 0));
    player.background.position.set(10, 10, 1);
    player.background.setVerticesColor(52 / 255, 111 / 255, 149 / 255, 1.0);
    const region = GLOBAL.assets.planetAtlas.getRegion('blank.png');
    player.background.setTextureRegion(region, false);

    const start = 300;
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
      new ShipCell(150, 100),
      new ShipCell(250, 100),
      new ShipCell(100, 200),
      new ShipCell(300, 200),
      new ShipCell(200, 225),
    );

    player.health = new HealthBar(20, 550);
    player.health.updateHealth(playerData.shipHealth, playerData.shipMaxHealth);

    return player;
  }

  background: Sprite;
  playerStats: PlayerStatsRow[] = [];
  shipCells: ShipCell[] = [];
  health: HealthBar;

  playerData: PlayerData;

  updateText(): void {

  }

  getSpritesToRender(): Sprite[] {
    const result: Sprite[] = [this.background, this.health.back, this.health.current];
    for (const cell of this.shipCells) {
      result.push(cell.cellSprite);
    }
    return result;
  }

  getTextsToRender(): Text[] {
    const result: Text[] = [];

    for (const stat of this.playerStats) {
      result.push(stat.caption, stat.value);
    }

    return result;
  }
}