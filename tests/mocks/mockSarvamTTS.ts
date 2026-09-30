export class MockSarvamTTS {
  async synthesize(text: string): Promise<Buffer> {
    return Buffer.alloc(1600); // 100ms of silence
  }
}
