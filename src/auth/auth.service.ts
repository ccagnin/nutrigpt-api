import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signup() {
    return 'Registrei';
  }

  login() {
    return 'Logay';
  }
}
