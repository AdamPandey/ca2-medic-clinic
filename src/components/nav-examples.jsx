import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";
import { useLocation } from "react-router";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

export function NavExamples({ items }) {
  let location = useLocation();

  const checkActive = (url) => {
    if (location.pathname === "/" && url === "/") {
      console.log("You are in dashboard");
      return true;
    } else if (url !== "/" && location.pathname.includes(url)) {
      console.log("You are somwhere else");
      return true;
    }

    return false;
  };

  // console.log(location);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Examples</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              tooltip={item.name}
              isActive={checkActive(item.url)}
            >
              <Link to={item.url}>
                {item.icon && <item.icon />}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
