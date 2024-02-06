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
  _id?: string;
  District: string;
  FacilityName: string;
  ImgUrl: string;
  Latitude: string;
  Longitude: string;
  Ownership: string;
  Region: string;
  Town: string;
  Type: string;
  __v?: number;
};
export type IFilter ={
  ownership: string;
  type: string;
  town: string;
}
export type IFilterResponse = {
  success: boolean;
  data: ISearch[];
  message: string;
};