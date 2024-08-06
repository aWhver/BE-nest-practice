export class AddPosDto {
  posName: string;
  longitude: number;
  latitude: number;
}

export class SearchDto {
  longitude: number;
  latitude: number;
  radius: number;
  geoUnits?: 'm' | 'km' | 'mi' | 'ft';
}
