/**
 * Role-aware account URLs. Backend roles stay; UX presents a unified model.
 */

export function dashboardHrefForRole(role: string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "MASTER":
      return "/master/dashboard";
    default:
      return "/customer/dashboard";
  }
}

export function listingsHrefForRole(_role?: string): string {
  return "/listings";
}

export function listingsCreateHref(): string {
  return "/listings/create";
}

export function favoritesHrefForRole(role: string | undefined): string {
  return role === "MASTER" ? "/master/favorites" : "/customer/favorites";
}

export function messagesHrefForRole(role: string | undefined): string {
  return role === "MASTER" ? "/messages" : "/customer/messages";
}

export function bookingsHrefForRole(role: string | undefined): string {
  return role === "MASTER" ? "/master/orders" : "/customer/bookings";
}

export function settingsHrefForRole(role: string | undefined): string {
  return role === "MASTER" ? "/master/settings" : "/customer/settings";
}
