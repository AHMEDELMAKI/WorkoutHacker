import { userApi } from './user.api';
import { useAuthStore } from '../../store/authStore';

// Mock auth store
jest.mock('../../store/authStore', () => ({
    useAuthStore: {
        getState: jest.fn(() => ({ user: { id: 'test-user' } })),
    },
}));

// Mock API client
jest.mock('./client', () => ({
    api: {
        get: jest.fn(),
        put: jest.fn(),
    },
}));

import { api } from './client';

describe('userApi', () => {
    it('should normalize profile data correctly', async () => {
        const rawResponse = {
            data: {
                id: '123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                profile: {
                    heightCm: 180,
                    weightKg: 80,
                    ageYears: 30,
                    gender: 'MALE',
                    onboardingDone: true,
                    fitnessLevel: 'INTERMEDIATE',
                    fitnessGoals: ['build_muscle'],
                },
            },
        };

        (api.get as jest.Mock).mockResolvedValue(rawResponse);

        const profile = await userApi.getProfile('123');

        expect(profile.id).toBe('123');
        expect(profile.firstName).toBe('John');
        expect(profile.heightCm).toBe(180);
        expect(profile.gender).toBe('male'); // Normalized
        expect(profile.fitnessLevel).toBe('intermediate'); // Normalized
        expect(profile.onboardingDone).toBe(true);
    });
});
