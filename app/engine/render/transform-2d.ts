import { Vector } from './../math/vector';
import { Renderer2D } from './renderer-2d';

export class Transform2D {
    public parent: Transform2D;
    public childs: Transform2D[];

    public position: Vector = new Vector(0, 0);
    private _look: Vector = new Vector(0, 1);

    public render(renderer: Renderer2D): void {
        renderer.save();
        renderer.transform(this.position, this.look);

        this.doRenderSelf(renderer);
        this.doRenderChilds(renderer);

        renderer.restore();
    }

    protected doRenderSelf(renderer: Renderer2D): void { }

    protected doRenderChilds(renderer: Renderer2D): void {
        if (!this.childs)
            return;

        this.childs.forEach(child => child.render(renderer));
    }

    public get look() {
        return this._look;
    }

    public set look(value: Vector) {
        this._look = value.normal();
    }
}
