export class AudioManager {
  private _context: AudioContext = new AudioContext();
  private _sounds: { [key: string]: AudioBuffer } = {};
  private _music: { [key: string]: AudioBuffer } = {};
  private _masterVolume: GainNode = this._context.createGain();
  private _soundVolume: GainNode = this._context.createGain();
  private _musicVolume: GainNode = this._context.createGain();

  constructor() {
    this._masterVolume.gain.value = 0.3;
    this._masterVolume.connect(this._context.destination);

    this._soundVolume.connect(this._masterVolume);
    this._musicVolume.connect(this._masterVolume);
  }

  get masterVolume(): number {
    return this._masterVolume.gain.value;
  }

  set masterVolume(value: number) {
    this._masterVolume.gain.value = value;
  }

  get soundVolume(): number {
    return this._soundVolume.gain.value;
  }

  set soundVolume(value: number) {
    this._soundVolume.gain.value = value;
  }

  get musicVolume(): number {
    return this._musicVolume.gain.value;
  }

  set musicVolume(value: number) {
    this._musicVolume.gain.value = value;
  }

  addSound(audioData: any, soundName: string): Promise<AudioBuffer> {
    return this._context.decodeAudioData(audioData)
      .then(buffer => this._sounds[soundName] = buffer);
  }

  playSound(soundName: string): void {
    const source = this._context.createBufferSource();
    source.buffer = this._sounds[soundName];
    source.connect(this._soundVolume);
    source.start();
  }

  addMusic(audioData: any, musicName: string): Promise<AudioBuffer> {
    return this._context.decodeAudioData(audioData)
      .then(buffer => this._music[musicName] = buffer);
  }

  playMusic(musicName: string): void {
    const source = this._context.createBufferSource();
    source.buffer = this._music[musicName];
    source.connect(this._musicVolume);
    source.loop = true;
    source.start();
  }
}
