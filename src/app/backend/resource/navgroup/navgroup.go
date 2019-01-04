package navgroup

import (
	"encoding/json"
	"os"
)

type NavGroup struct {
	Navs []NavInfo `json:"navs"`
}

type NavInfo struct {
	Title          string `json:"title"`
	Url            string `json:"url"`
	ServiceAccount string `json:"serviceaccount"`
}

// 获取导航菜单
func GetNavGroup() (NavGroup, error) {
	navgroup := os.Getenv("KUBE_DASHBOARD_NAV_GROUP")

	var navGroup NavGroup
	if navgroup != "" {
		data := `{
			"navs":` + navgroup + `
		}`
		err := json.Unmarshal([]byte(data), &navGroup)
		if err != nil {
			return navGroup, err
		}
	}
	return navGroup, nil
}
