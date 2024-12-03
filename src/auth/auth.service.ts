import {
    ConflictException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserLogin, UserRegister } from 'src/interfaces/user.interface';
import { UserService } from 'src/user/user.service';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
    ) {}

    async registerUser(payload: UserRegister) {
        const { username, password, passwordConfirm } = payload;
        try {
            await this.usersService.create({
                username,
                password,
                passwordConfirm,
            });
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Username already exists');
            }
            throw error;
        }

        return { message: 'User registered successfully' };
    }

    async loginUser(
        payload: UserLogin,
    ): Promise<{ accessToken: string; user: User }> {
        const { username, password } = payload;
        const user = await this.usersService.findOne(username);
        if (!user || user.password !== password) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const accessToken = await this.jwtService.signAsync({
            id: user._id,
            username: user.username,
        });
        return { accessToken, user };
    }

    async logOutUser(payload: { username: string }) {
        const { username } = payload;
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return { message: 'User logged out successfully' };
    }
}
