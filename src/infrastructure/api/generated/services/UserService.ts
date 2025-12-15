/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Register new user with email/password
     * Creates a new user account. Returns JWT token and user info. If email already exists (e.g., from OAuth), returns error message.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postUsersRegister(
        requestBody: {
            email: string;
            password: string;
            name: string;
        },
    ): CancelablePromise<{
        token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
        isNewUser: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Login with email/password
     * Authenticates user with email and password. Returns JWT token. OAuth users cannot login with password.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postUsersLogin(
        requestBody: {
            email: string;
            password: string;
        },
    ): CancelablePromise<{
        token: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                401: `Default Response`,
            },
        });
    }
    /**
     * Request password reset link
     * Sends a password reset link to the email. Always returns success to prevent email enumeration. Link expires in 1 hour.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postUsersForgotPassword(
        requestBody: {
            email: string;
        },
    ): CancelablePromise<{
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/forgot-password',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Reset password with token
     * Reset password using the token from the reset link sent to email. Token is 64 characters and can only be used once.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postUsersResetPassword(
        requestBody: {
            token: string;
            newPassword: string;
        },
    ): CancelablePromise<{
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/reset-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Get current user
     * @returns any Default Response
     * @throws ApiError
     */
    public static getUsersMe(): CancelablePromise<{
        id: string;
        email: string;
        name: string;
        createdAt: string;
        updatedAt: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
        });
    }
    /**
     * Update profile
     * Update user profile (name).
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static patchUsersMe(
        requestBody: {
            name: string;
        },
    ): CancelablePromise<{
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Delete account permanently
     * Permanently delete account and all data. Requires confirmation: "DELETE_MY_ACCOUNT". Email users must provide password.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static deleteUsersMe(
        requestBody: {
            password?: string;
            confirmation: 'DELETE_MY_ACCOUNT';
        },
    ): CancelablePromise<{
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                401: `Default Response`,
            },
        });
    }
    /**
     * Search users by exact email
     * Search for a user by EXACT email address to share folders with. Returns empty array if not found (prevents email enumeration).
     * @param email
     * @returns any Default Response
     * @throws ApiError
     */
    public static getUsersSearch(
        email: string,
    ): CancelablePromise<Array<{
        id: string;
        name: string;
        email: string;
    }>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/search',
            query: {
                'email': email,
            },
            errors: {
                400: `Default Response`,
            },
        });
    }
    /**
     * Get user by ID
     * Get user info by ID (for sharing preview).
     * @param userId
     * @returns any Default Response
     * @throws ApiError
     */
    public static getUsers(
        userId: string,
    ): CancelablePromise<{
        id: string;
        email: string;
        name: string;
        createdAt: string;
        updatedAt: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                404: `Default Response`,
            },
        });
    }
    /**
     * Change password
     * Change password (email/password users only). OAuth users cannot change password.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postUsersMeChangePassword(
        requestBody: {
            currentPassword: string;
            newPassword: string;
        },
    ): CancelablePromise<{
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/me/change-password',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                401: `Default Response`,
            },
        });
    }
    /**
     * Deactivate account
     * Deactivate account (soft delete). Anonymizes user data but keeps records. Email users must provide password.
     * @param requestBody
     * @returns any Default Response
     * @throws ApiError
     */
    public static postUsersMeDeactivate(
        requestBody?: {
            password?: string;
        },
    ): CancelablePromise<{
        message: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/users/me/deactivate',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Default Response`,
                401: `Default Response`,
            },
        });
    }
}
