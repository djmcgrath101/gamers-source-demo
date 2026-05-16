import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  async hashSHA512(inputText: string): Promise<string> {
    return await this.#hashText(inputText, 'SHA-512');
  }

  async #hashText(inputText: string, algorithm: 'SHA-512'): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputText);

    const hashBuffer = await crypto.subtle.digest(algorithm, data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }
}
