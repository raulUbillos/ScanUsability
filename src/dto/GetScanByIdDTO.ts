export interface GetScanByIdUriParamsDTO{
    id:string
}

export interface GetScanByIdResponseDTO{
    id?: String,
    url?: String,
    status?: String,
    violations?: Object,
    error?: String,
    csvLink?: String
}