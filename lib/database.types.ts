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
