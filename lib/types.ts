export interface Database {
  public: {
    Tables: {
      menu_categories: {
        Row: MenuCategory;
        Insert: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MenuCategory, 'id'>>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<MenuItem, 'id'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Event, 'id'>>;
      };
      reservations: {
        Row: Reservation;
        Insert: Omit<Reservation, 'id' | 'created_at'>;
        Update: Partial<Omit<Reservation, 'id'>>;
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Omit<SiteSetting, 'id' | 'updated_at'>;
        Update: Partial<Omit<SiteSetting, 'id'>>;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<AdminUser, 'id'>>;
      };
    };
  };
}

export interface MenuCategory {
  id: string;
  name_pt: string;
  name_fr: string;
  name_en: string;
  slug: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name_pt: string;
  name_fr: string;
  name_en: string;
  description_pt: string;
  description_fr: string;
  description_en: string;
  price: number;
  image_url: string | null;
  badge_pt: string | null;
  badge_fr: string | null;
  badge_en: string | null;
  featured: boolean;
  portion: string | null;
  tagline_pt: string | null;
  tagline_fr: string | null;
  tagline_en: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  day_label: string;
  title_pt: string;
  title_fr: string;
  title_en: string;
  description_pt: string;
  description_fr: string;
  description_en: string;
  time_range: string;
  icon: string;
  color: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reservation {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  name: string | null;
  phone: string;
  email: string | null;
  special_requests: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface SiteSetting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: 'admin' | 'editor';
  created_at: string;
  updated_at: string;
}
