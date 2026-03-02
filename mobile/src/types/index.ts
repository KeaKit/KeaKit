export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  token?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  token: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: { user: AuthUser };
  EditProfile: { user: AuthUser };
};

export interface ProfileData {
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export const EUROPEAN_COUNTRIES = [
  { value: "Albania", label: "Albania" },
  { value: "Andorra", label: "Andorra" },
  { value: "Armenia", label: "Armenia" },
  { value: "Austria", label: "Austria" },
  { value: "Azerbaijan", label: "Azerbaiyán" },
  { value: "Belarus", label: "Bielorrusia" },
  { value: "Belgium", label: "Bélgica" },
  { value: "Bosnia and Herzegovina", label: "Bosnia y Herzegovina" },
  { value: "Bulgaria", label: "Bulgaria" },
  { value: "Croatia", label: "Croacia" },
  { value: "Cyprus", label: "Chipre" },
  { value: "Czech Republic", label: "República Checa" },
  { value: "Denmark", label: "Dinamarca" },
  { value: "Estonia", label: "Estonia" },
  { value: "Finland", label: "Finlandia" },
  { value: "France", label: "Francia" },
  { value: "Georgia", label: "Georgia" },
  { value: "Germany", label: "Alemania" },
  { value: "Greece", label: "Grecia" },
  { value: "Hungary", label: "Hungría" },
  { value: "Iceland", label: "Islandia" },
  { value: "Ireland", label: "Irlanda" },
  { value: "Italy", label: "Italia" },
  { value: "Kazakhstan", label: "Kazajistán" },
  { value: "Kosovo", label: "Kosovo" },
  { value: "Latvia", label: "Letonia" },
  { value: "Liechtenstein", label: "Liechtenstein" },
  { value: "Lithuania", label: "Lituania" },
  { value: "Luxembourg", label: "Luxemburgo" },
  { value: "Malta", label: "Malta" },
  { value: "Moldova", label: "Moldavia" },
  { value: "Monaco", label: "Mónaco" },
  { value: "Montenegro", label: "Montenegro" },
  { value: "Netherlands", label: "Países Bajos" },
  { value: "North Macedonia", label: "Macedonia del Norte" },
  { value: "Norway", label: "Noruega" },
  { value: "Poland", label: "Polonia" },
  { value: "Portugal", label: "Portugal" },
  { value: "Romania", label: "Rumanía" },
  { value: "Russia", label: "Rusia" },
  { value: "San Marino", label: "San Marino" },
  { value: "Serbia", label: "Serbia" },
  { value: "Slovakia", label: "Eslovaquia" },
  { value: "Slovenia", label: "Eslovenia" },
  { value: "Spain", label: "España" },
  { value: "Sweden", label: "Suecia" },
  { value: "Switzerland", label: "Suiza" },
  { value: "Turkey", label: "Turquía" },
  { value: "Ukraine", label: "Ucrania" },
  { value: "United Kingdom", label: "Reino Unido" },
  { value: "Vatican City", label: "Ciudad del Vaticano" }
];