export type IOwnership = {
  success: boolean;
  data: string[];
};
export type ITownResponse = {
  success: boolean;
  data: string[];
};
export type ITown = {
  _id: string;
  Town: string;
};
export type ISearchResponse = {
  success: boolean;
  data: ISearch[];
  message: string;
};

export type ISearch = {
  District: string;
  FacilityName: string;
  ImgUrl: string;
  Latitude: string;
  Longitude: string;
  Ownership: string;
  Region: string;
  Town: string;
  Type: string;
};
