export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      favorite_orders: {
        Row: {
          id: string
          user_id: string
          name: string
          items: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          items: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          items?: Json
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          category: string
          image_url: string
          in_stock: boolean
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          category: string
          image_url: string
          in_stock?: boolean
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          category?: string
          image_url?: string
          in_stock?: boolean
          active?: boolean
          created_at?: string
        }
      }
      combos: {
        Row: {
          id: string
          name: string
          products: string[]
          original_price: number
          combo_price: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          products: string[]
          original_price: number
          combo_price: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          products?: string[]
          original_price?: number
          combo_price?: number
          active?: boolean
          created_at?: string
        }
      }
      customer_profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          city: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string
          phone?: string
          city?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          city?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          items: Json
          total: number
          customer_city: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          items: Json
          total: number
          customer_city?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          items?: Json
          total?: number
          customer_city?: string | null
          status?: string
          created_at?: string
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string
          cta: string
          cta_link: string
          bg_color: string
          text_color: string
          highlight: string | null
          tags: string[]
          sort_order: number
          active: boolean
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle: string
          cta?: string
          cta_link?: string
          bg_color?: string
          text_color?: string
          highlight?: string | null
          tags?: string[]
          sort_order?: number
          active?: boolean
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string
          cta?: string
          cta_link?: string
          bg_color?: string
          text_color?: string
          highlight?: string | null
          tags?: string[]
          sort_order?: number
          active?: boolean
          image_url?: string | null
          created_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          name: string
          text: string
          rating: number
          approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          text: string
          rating: number
          approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          text?: string
          rating?: number
          approved?: boolean
          created_at?: string
        }
      }
    }
  }
}
