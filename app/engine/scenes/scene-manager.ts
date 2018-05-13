import { Keys, MouseButtons } from '../input/keys.enum';
import { Vector2 } from '../math/vector2';
import { Scene, SceneState } from './scene';

export class SceneManager {
  current: Scene | null = null;
  modal: Scene | null = null;
  scenes: { [key: string]: Scene } = {};

  addScene(name: string, scene: Scene): void {
    if (this.scenes[name]) {
      throw new Error(`Scene with name '${name}' already exists`);
    }

    this.scenes[name] = scene;
  }

  switchTo(sceneName: string): void {
    if (this.current) {
      this.current.unload()
        .then(() => {
          this.current = this.scenes[sceneName];
          this.current.load();
        });

      return;
    }

    this.current = this.scenes[sceneName];
    this.current.load();
  }

  showModal(sceneName: string): void {
    if (this.current) {
      this.current.setPause(true);
    }

    this.modal = this.scenes[sceneName];
    this.modal.load();
  }

  closeModal(): void {
    if (!this.modal) {
      throw new Error('Try to close modal but no modal found');
    }

    this.modal.unload()
      .then(() => {
        this.modal = null;
        if (this.current) {
          this.current.setPause(false);
        }
      });

    return;
  }

  update(deltaTime: number): void {
    for (const sceneName in this.scenes) {
      if (this.scenes[sceneName].state !== SceneState.Active) {
        continue;
      }

      this.scenes[sceneName].update(deltaTime);
    }
  }

  render(): void {
    for (const sceneName in this.scenes) {
      if (this.scenes[sceneName].state === SceneState.Hidden) {
        continue;
      }

      this.scenes[sceneName].render();
    }
  }

  onMouseMove(position: Vector2): void {
    for (const sceneName in this.scenes) {
      if (this.scenes[sceneName].state !== SceneState.Active) {
        continue;
      }

      this.scenes[sceneName].onMouseMove(position);
    }
  }

  onMouseDown(position: Vector2, button: MouseButtons): void {
    for (const sceneName in this.scenes) {
      if (this.scenes[sceneName].state !== SceneState.Active) {
        continue;
      }

      this.scenes[sceneName].onMouseDown(position, button);
    }
  }

  onMouseUp(position: Vector2, button: MouseButtons): void {
    for (const sceneName in this.scenes) {
      if (this.scenes[sceneName].state !== SceneState.Active) {
        continue;
      }

      this.scenes[sceneName].onMouseUp(position, button);
    }
  }

  onKeyDown(key: Keys): void {
    for (const sceneName in this.scenes) {
      if (this.scenes[sceneName].state !== SceneState.Active) {
        continue;
      }

      this.scenes[sceneName].onKeyDown(key);
    }
  }

  onKeyUp(key: Keys): void {
    for (const sceneName in this.scenes) {
      if (this.scenes[sceneName].state !== SceneState.Active) {
        continue;
      }

      this.scenes[sceneName].onKeyUp(key);
    }
  }
}