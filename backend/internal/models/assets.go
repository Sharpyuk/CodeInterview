package models


type AssetContainer struct {
	Assets     []Asset `json:"assets"`
	PageNumber int     `json:"page_number"`
	PageSize   int     `json:"page_size"`
	TotalPages int     `json:"total_pages"`
	TotalCount int     `json:"total_count"`
}

type Asset struct {
	ID        int
	Host      string
	Comment   string
	Owner     string
	IPs       []IP
	Ports     []Port
	Signature string
}

type IP struct {
	Address   string
	Signature string
}

type Port struct {
	Port      int
	Signature string
}
