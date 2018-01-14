import { Vector2 } from "../math/vector";
import { BlendingMode, CullMode, FuncComparison, ShaderId, TextureId, VertexBufferId, IndexBufferId, FrameBufferId, ClearMask, ShaderProgramId, IndexFormat } from 'webgl-types';
import { VertexBuffer } from "./vertex-buffer";
import { IndexBuffer } from "./index-buffer";
import { WebGLRegisterService, gl } from "./webgl";
import { FrameBuffer } from "./frame-buffer";
import { RenderParams } from "./render-params";
import { ShaderProgram } from "./shader-program";
import { Texture } from "./texture";


const TEXTURE_SAMPLERS_MAX = 8;

export class WebGLRenderer {
  public renderParams: RenderParams = new RenderParams();

  public get textureBinds(): number { return this._statTextureBind; }
  public get triCount(): number { return this._statTriCount; }
  public get dipCount(): number { return this._statDIPCount; }

  public get width(): number { return this._width; }
  public get height(): number { return this._height; }

  // private _internalVB: VertexBuffer;
  // private _internalIB: IndexBuffer;

  private _blendingMode: BlendingMode;
  private _cullMode: CullMode;

  private _depthWrite: boolean;
  private _depthTest: boolean;
  private _depthFunc: FuncComparison;

  private _shader: ShaderProgram | null;
  private _textureSampler: Texture[] = new Array<Texture>(TEXTURE_SAMPLERS_MAX);
  private _activeSampler: number;
  private _vertexBuffer: VertexBuffer | null;
  private _indexBuffer: IndexBuffer | null;
  private _frameBuffer: FrameBuffer | null;

  private _statTextureBind: number
  private _statTriCount: number;
  private _statDIPCount: number;

  private _width: number;
  private _height: number;

  constructor(private canvasElement: HTMLCanvasElement) {
    const glContext = <WebGLRenderingContext>(
      canvasElement.getContext('webgl') ||
      canvasElement.getContext('experimental-webgl')
    );

    if (!glContext) {
      console.log("GL initialize failed");
      return;
    }

    WebGLRegisterService.registerWebGLContext(glContext);

    this.initWebGL();
  }

  public resize(width: number, height: number): void {
    this.setViewPort(0, 0, width, height);
  }

  public resetStates(): void {
    this.setCullMode(CullMode.Back);
    this.setBlendingMode(BlendingMode.Alpha);
    this.setDepthFunc(FuncComparison.LessOrEqual);
    this.setDepthWrite(true);
    this.setDepthTest(true);

    this._activeSampler = -1;

    for (let i = 0; i < TEXTURE_SAMPLERS_MAX; ++i) {
      this._textureSampler[i] = 0;
    }

    this._shader = null;
    this._vertexBuffer = null;
    this._indexBuffer = null;
    this._frameBuffer = null;

    this.renderParams.color.set(1, 1, 1, 1);
    this.renderParams.viewProjection.identity();
    this.renderParams.model.identity();
  }

  public resetStatistics(): void {
    this._statDIPCount = 0;
    this._statTextureBind = 0;
    this._statTriCount = 0;
  }

  public clear(clearMask: ClearMask): void {

  }

  public setClearColorRGB(r: number, g: number, b: number): void {
    gl.clearColor(r, g, b, 1.0);
  }

  public setViewPort(left: number, top: number, width: number, height: number): void {
    this._width = width;
    this._height = height;
    gl.viewport(left, top, width, height);
  }

  public setCullMode(cullMode: CullMode): void {
    if (cullMode === this._cullMode) { return; }

    switch (cullMode) {
      case CullMode.None: gl.disable(gl.CULL_FACE); break;
      case CullMode.Front: gl.cullFace(gl.FRONT); break;
      case CullMode.Back: gl.cullFace(gl.BACK); break;
    }

    // If PREVIOUS state was None we should enable CullFace now
    if (this._cullMode === CullMode.None) {
      gl.enable(gl.CULL_FACE);
    }

    this._cullMode = cullMode;
  }

  public setBlendingMode(blendingMode: BlendingMode): void {
    if (blendingMode === this._blendingMode) { return; }

    switch (blendingMode) {
      case BlendingMode.None: gl.disable(gl.BLEND); break;
      case BlendingMode.Alpha: gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); break;
      case BlendingMode.Additive: gl.blendFunc(gl.ONE, gl.ONE); break;
      case BlendingMode.Multiply: gl.blendFunc(gl.DST_COLOR, gl.ZERO); break;
      case BlendingMode.Screen: gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_COLOR); break;
    }

    // If PREVIOUS state was None we should enable blend now
    if (this._blendingMode === BlendingMode.None) {
      gl.enable(gl.BLEND);
    }

    this._blendingMode = blendingMode;
  }

  public setDepthWrite(enabled: boolean): void {
    if (enabled === this._depthWrite) { return; }

    gl.depthMask(enabled);
    this._depthWrite = enabled;
  }

  public setDepthTest(enabled: boolean): void {
    if (enabled === this._depthTest) { return; }

    if (enabled) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    this._depthTest = enabled;
  }

  public setDepthFunc(comparison: FuncComparison): void {
    if (comparison === this._depthFunc) { return; }

    gl.depthFunc(this.getWebGLComparison(comparison));
    this._depthFunc = comparison;
  }

  public setShader(shader: ShaderProgram): void {
    if (shader === this._shader) { return; }

    gl.useProgram(shader.program);
    this._shader = shader;
  }

  public setTexture(texture: Texture, sampler: number): void {
    if (this._textureSampler[sampler] === texture) { return; }

    if (this._activeSampler !== sampler) {
      gl.activeTexture(gl.TEXTURE0 + sampler);
      this._activeSampler = sampler;
    }

    gl.bindTexture(gl.TEXTURE_2D, texture);

    this._textureSampler[sampler] = texture;
    ++this._statTextureBind;
  }

  public setVertexBuffer(vertexBuffer: VertexBuffer | null): void {
    if (!vertexBuffer) {
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      return;
    }

    if (vertexBuffer === this._vertexBuffer) { return; }

    vertexBuffer.bind();
    this._vertexBuffer = vertexBuffer;
  }

  public setIndexBuffer(indexBuffer: IndexBuffer): void {
    if (!indexBuffer) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      return;
    }

    if (indexBuffer === this._indexBuffer) { return; }

    indexBuffer.bind();
    this._indexBuffer = indexBuffer;
  }

  public drawTriangles(vertexBuffer: VertexBuffer, indexBuffer: IndexBuffer, startIndex: number, indicesCount: number): void {
    this.setVertexBuffer(vertexBuffer);
    this.setIndexBuffer(indexBuffer);

    gl.drawElements(
      gl.TRIANGLES,
      indicesCount,
      IndexBuffer.getWebGLFormat(indexBuffer.format),
      startIndex * IndexBuffer.getSizeFromFormat(indexBuffer.format)
    );

    ++this._statDIPCount;
    this._statTriCount += Math.floor(indicesCount / 3);
  }

  public drawPoints(vertexBuffer: VertexBuffer, start: number, vertCount: number): void {

  }

  /*public drawScreenQuad(aMaterial: Material): void {

  }*/

  private initWebGL(): void {
    const logInfo = `
      Graphics information:
      Vendor: ${gl.getParameter(gl.VENDOR)}
      Renderer: ${gl.getParameter(gl.RENDERER)}
      OpenGL: ${gl.getParameter(gl.VERSION)}
      GLSL: ${gl.getParameter(gl.SHADING_LANGUAGE_VERSION)}
      `;
    console.log(logInfo);
  }

  private createScreenQuad(): void {

  }

  private getWebGLComparison(comparison: FuncComparison): number {
    switch (comparison) {
      case FuncComparison.Never: return gl.NEVER;
      case FuncComparison.Less: return gl.LESS;
      case FuncComparison.Equal: return gl.EQUAL;
      case FuncComparison.LessOrEqual: return gl.LEQUAL;
      case FuncComparison.Greater: return gl.GREATER;
      case FuncComparison.NotEqual: return gl.NOTEQUAL;
      case FuncComparison.GreaterOrEqual: return gl.GEQUAL;
      case FuncComparison.Always: return gl.ALWAYS;
    }
  }
}
