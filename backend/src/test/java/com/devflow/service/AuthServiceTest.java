package com.devflow.service;

import com.devflow.dto.auth.AuthResponse;
import com.devflow.dto.auth.LoginRequest;
import com.devflow.dto.auth.RegisterRequest;
import com.devflow.entity.User;
import com.devflow.exception.ConflictException;
import com.devflow.repository.UserRepository;
import com.devflow.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, tokenProvider);
    }

    @Test
    @DisplayName("Should successfully register new user with hashed password and return JWT")
    void testRegisterSuccess() {
        RegisterRequest request = new RegisterRequest("alex@devflow.local", "secret123", "Alex Dev");

        when(userRepository.existsByEmail("alex@devflow.local")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("$2a$10$hashedPassword");

        User savedUser = new User("alex@devflow.local", "$2a$10$hashedPassword", "Alex Dev");
        savedUser.setId(UUID.randomUUID());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(tokenProvider.generateToken(savedUser.getId(), savedUser.getEmail())).thenReturn("jwt-token-xyz");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("jwt-token-xyz");
        assertThat(response.getUser().getEmail()).isEqualTo("alex@devflow.local");
        assertThat(response.getUser().getFullName()).isEqualTo("Alex Dev");
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ConflictException when registering with duplicate email")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = new RegisterRequest("existing@devflow.local", "secret123", "Existing User");
        when(userRepository.existsByEmail("existing@devflow.local")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Should authenticate user and return token on valid login")
    void testLoginSuccess() {
        LoginRequest request = new LoginRequest("alex@devflow.local", "secret123");
        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        User user = new User("alex@devflow.local", "hashed", "Alex Dev");
        user.setId(UUID.randomUUID());
        when(userRepository.findByEmail("alex@devflow.local")).thenReturn(Optional.of(user));
        when(tokenProvider.generateToken(auth)).thenReturn("jwt-token-123");

        AuthResponse response = authService.login(request);

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("jwt-token-123");
        assertThat(response.getUser().getEmail()).isEqualTo("alex@devflow.local");
    }

    @Test
    @DisplayName("Should throw BadCredentialsException on incorrect password")
    void testLoginInvalidCredentials() {
        LoginRequest request = new LoginRequest("alex@devflow.local", "wrongpassword");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);
    }
}
