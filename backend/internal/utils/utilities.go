package utils

import (
	"strconv"
	"crypto/sha256"
	"encoding/hex"

	"interview/internal/models"
)


// hashString - new function to perform sha256 hashing, used to replace duplication of code.
func hashString(s string) string {
	hash := sha256.New()
	hash.Write([]byte(s))
	return hex.EncodeToString(hash.Sum(nil))
}

// GenerateSignature - updated to use new hashString function, whilst removing unnecassary NewAsset variable.
//  replaced fmt.Sprintf with strconv.Itoa which is slightly more efficient as it is optimised for this use
func GenerateSignature(asset models.Asset) models.Asset {
	data := asset.Host + asset.Comment + asset.Owner
	asset.Signature = hashString(data)

	for i, ip := range asset.IPs {
		asset.IPs[i].Signature = hashString(ip.Address)
	}

	for i, port := range asset.Ports {
		asset.Ports[i].Signature = hashString(strconv.Itoa(port.Port))
	}

	return asset
}

// IpExists - function to check if IP exists in the slice of IP.  Could use a generic function here, but not as efficient and takes considerably longer.
func IpExists(IPs []models.IP, ip models.IP) bool {
	for _, i := range IPs {
		if i.Address == ip.Address {
			return true
		}
	}
	return false
}

// PortExists - function to check if port exists in the slice of Port.  Could use a generic function here, but not as efficient and takes considerably longer.
func PortExists(ports []models.Port, port models.Port) bool {
	for _, p := range ports {
		if p.Port == port.Port {
			return true
		}
	}
	return false
}
