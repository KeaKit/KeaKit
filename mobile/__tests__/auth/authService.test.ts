import { registerUser, loginUser } from '../../src/services/authService';
import { API_ROUTES } from '../../src/config/api';

const mockFetch = jest.fn();
(globalThis as any).fetch = mockFetch;

const buildRegisterRequest = () => ({
  name:     'Test User',
  email:    'test@example.com',
  password: 'password123',
  phone:    '+34612345678',
  address:  'Calle Mayor 1',
  city:     'Sevilla',
  country:  'Spain',
});

const buildLoginRequest = () => ({
  email:    'test@example.com',
  password: 'password123',
});

const buildUserResponse = () => ({
  id:    1,
  name:  'Test User',
  email: 'test@example.com',
  token: 'header.payload.signature',
});

const mockJsonResponse = (body: object, status = 200) =>
  mockFetch.mockResolvedValueOnce({
    ok:      status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json:    () => Promise.resolve(body),
    text:    () => Promise.resolve(JSON.stringify(body)),
  });

const mockTextResponse = (text: string, status: number) =>
  mockFetch.mockResolvedValueOnce({
    ok:      false,
    status,
    headers: { get: () => 'text/plain' },
    json:    () => Promise.reject(new Error('not json')),
    text:    () => Promise.resolve(text),
  });

beforeEach(() => mockFetch.mockClear());

describe('registerUser', () => {

  it('llama a fetch con el endpoint, método y headers correctos', async () => {
    mockJsonResponse(buildUserResponse());

    await registerUser(buildRegisterRequest());

    expect(mockFetch).toHaveBeenCalledWith(
      API_ROUTES.REGISTER,
      expect.objectContaining({
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildRegisterRequest()),
      }),
    );
  });

  it('devuelve UserResponse cuando el servidor responde 200', async () => {
    const expected = buildUserResponse();
    mockJsonResponse(expected);

    const result = await registerUser(buildRegisterRequest());

    expect(result).toEqual(expected);
  });

  it('lanza error con mensaje del servidor cuando responde 409', async () => {
    mockJsonResponse({ message: 'Email already exists' }, 409);

    await expect(registerUser(buildRegisterRequest()))
      .rejects.toThrow('Email already exists');
  });

  it('normaliza el error de email inválido del backend', async () => {
    mockJsonResponse({ message: 'Email should be valid' }, 400);

    await expect(registerUser(buildRegisterRequest()))
      .rejects.toThrow('El formato del correo no es válido.');
  });

  it('normaliza el error de contraseña débil del backend', async () => {
    mockJsonResponse({ message: 'Password must be at least 6 characters' }, 400);

    await expect(registerUser(buildRegisterRequest()))
      .rejects.toThrow('La contraseña es demasiado débil (mínimo 6 caracteres).');
  });

  it('normaliza el error de tamaño de dirección del backend', async () => {
    mockJsonResponse({ message: 'Address size must be between 5 and 255' }, 400);

    await expect(registerUser(buildRegisterRequest()))
      .rejects.toThrow('El tamaño de la dirección debe estar entre 5 y 255 caracteres.');
  });

  it('normaliza el error de tamaño de nombre del backend', async () => {
    mockJsonResponse({ message: 'Name size must be between 2 and 100' }, 400);

    await expect(registerUser(buildRegisterRequest()))
      .rejects.toThrow('El tamaño del nombre debe estar entre 2 y 100 caracteres.');
  });

  it('maneja respuesta de error sin JSON (texto plano)', async () => {
    mockTextResponse('Internal Server Error', 500);

    await expect(registerUser(buildRegisterRequest()))
      .rejects.toThrow('Internal Server Error');
  });

  it('usa el campo error del body si no existe message', async () => {
    mockJsonResponse({ error: 'Something went wrong' }, 500);

    await expect(registerUser(buildRegisterRequest()))
      .rejects.toThrow('Something went wrong');
  });
});

describe('loginUser', () => {

  it('llama a fetch con el endpoint, método y headers correctos', async () => {
    mockJsonResponse(buildUserResponse());

    await loginUser(buildLoginRequest());

    expect(mockFetch).toHaveBeenCalledWith(
      API_ROUTES.LOGIN,
      expect.objectContaining({
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(buildLoginRequest()),
      }),
    );
  });

  it('devuelve UserResponse cuando el servidor responde 200', async () => {
    const expected = buildUserResponse();
    mockJsonResponse(expected);

    const result = await loginUser(buildLoginRequest());

    expect(result).toEqual(expected);
  });

  it('lanza error cuando el usuario no existe (404)', async () => {
    mockJsonResponse({ message: 'User not found' }, 404);

    await expect(loginUser(buildLoginRequest()))
      .rejects.toThrow('User not found');
  });

  it('lanza error cuando la contraseña es incorrecta (401)', async () => {
    mockJsonResponse({ message: 'Invalid password' }, 401);

    await expect(loginUser(buildLoginRequest()))
      .rejects.toThrow('Invalid password');
  });

  it('normaliza el error de email inválido del backend', async () => {
    mockJsonResponse({ message: 'Email should be valid' }, 400);

    await expect(loginUser(buildLoginRequest()))
      .rejects.toThrow('El formato del correo no es válido.');
  });

  it('maneja respuesta de error sin JSON (texto plano)', async () => {
    mockTextResponse('Service Unavailable', 503);

    await expect(loginUser(buildLoginRequest()))
      .rejects.toThrow('Service Unavailable');
  });

    it('lanza error genérico con el status si el body está vacío', async () => {
    mockJsonResponse({}, 500);

    await expect(loginUser(buildLoginRequest()))
        .rejects.toThrow('{}');
    });
});