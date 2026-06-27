export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      acusados: {
        Row: {
          activo: boolean
          apellidos: string
          cargo: string | null
          cedula: string | null
          cedula_prefix: string | null
          created_at: string
          denuncias_count: number
          estado: string | null
          estado_revision: Database["public"]["Enums"]["estado_revision"]
          foto_url: string | null
          id: string
          institucion: string | null
          municipio: string | null
          nombres: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          apellidos: string
          cargo?: string | null
          cedula?: string | null
          cedula_prefix?: string | null
          created_at?: string
          denuncias_count?: number
          estado?: string | null
          estado_revision?: Database["public"]["Enums"]["estado_revision"]
          foto_url?: string | null
          id?: string
          institucion?: string | null
          municipio?: string | null
          nombres: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          apellidos?: string
          cargo?: string | null
          cedula?: string | null
          cedula_prefix?: string | null
          created_at?: string
          denuncias_count?: number
          estado?: string | null
          estado_revision?: Database["public"]["Enums"]["estado_revision"]
          foto_url?: string | null
          id?: string
          institucion?: string | null
          municipio?: string | null
          nombres?: string
          updated_at?: string
        }
        Relationships: []
      }
      denuncias: {
        Row: {
          acusado_id: string
          ai_score: number | null
          codigo: string
          created_at: string
          descripcion: string
          estado: Database["public"]["Enums"]["estado_revision"]
          fuente_url: string | null
          id: string
          lat: number | null
          lng: number | null
          moderado_en: string | null
          moderado_por: string | null
          ocurrido_en: string | null
          origen: Database["public"]["Enums"]["origen_denuncia"]
          tipo: Database["public"]["Enums"]["tipo_delito"]
          updated_at: string
        }
        Insert: {
          acusado_id: string
          ai_score?: number | null
          codigo?: string
          created_at?: string
          descripcion: string
          estado?: Database["public"]["Enums"]["estado_revision"]
          fuente_url?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          moderado_en?: string | null
          moderado_por?: string | null
          ocurrido_en?: string | null
          origen?: Database["public"]["Enums"]["origen_denuncia"]
          tipo: Database["public"]["Enums"]["tipo_delito"]
          updated_at?: string
        }
        Update: {
          acusado_id?: string
          ai_score?: number | null
          codigo?: string
          created_at?: string
          descripcion?: string
          estado?: Database["public"]["Enums"]["estado_revision"]
          fuente_url?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          moderado_en?: string | null
          moderado_por?: string | null
          ocurrido_en?: string | null
          origen?: Database["public"]["Enums"]["origen_denuncia"]
          tipo?: Database["public"]["Enums"]["tipo_delito"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_acusado_id_fkey"
            columns: ["acusado_id"]
            isOneToOne: false
            referencedRelation: "acusados"
            referencedColumns: ["id"]
          },
        ]
      }
      evidencias: {
        Row: {
          created_at: string
          denuncia_id: string
          id: string
          nombre: string | null
          tipo: Database["public"]["Enums"]["tipo_evidencia"]
          url: string | null
        }
        Insert: {
          created_at?: string
          denuncia_id: string
          id?: string
          nombre?: string | null
          tipo: Database["public"]["Enums"]["tipo_evidencia"]
          url?: string | null
        }
        Update: {
          created_at?: string
          denuncia_id?: string
          id?: string
          nombre?: string | null
          tipo?: Database["public"]["Enums"]["tipo_evidencia"]
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidencias_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      moderadores: {
        Row: {
          created_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      replicas: {
        Row: {
          acusado_id: string
          autor: string | null
          contacto: string | null
          contenido: string
          created_at: string
          denuncia_id: string | null
          estado: Database["public"]["Enums"]["estado_revision"]
          id: string
          moderado_en: string | null
          updated_at: string
        }
        Insert: {
          acusado_id: string
          autor?: string | null
          contacto?: string | null
          contenido: string
          created_at?: string
          denuncia_id?: string | null
          estado?: Database["public"]["Enums"]["estado_revision"]
          id?: string
          moderado_en?: string | null
          updated_at?: string
        }
        Update: {
          acusado_id?: string
          autor?: string | null
          contacto?: string | null
          contenido?: string
          created_at?: string
          denuncia_id?: string | null
          estado?: Database["public"]["Enums"]["estado_revision"]
          id?: string
          moderado_en?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "replicas_acusado_id_fkey"
            columns: ["acusado_id"]
            isOneToOne: false
            referencedRelation: "acusados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replicas_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      crear_denuncia: {
        Args: {
          p_acusado: Json
          p_descripcion: string
          p_evidencias?: Json
          p_lat?: number
          p_lng?: number
          p_ocurrido_en?: string
          p_origen?: Database["public"]["Enums"]["origen_denuncia"]
          p_tipo: Database["public"]["Enums"]["tipo_delito"]
        }
        Returns: string
      }
      es_moderador: { Args: never; Returns: boolean }
      obtener_seguimiento: {
        Args: { p_codigo: string }
        Returns: {
          acusado_apellidos: string
          acusado_cargo: string
          acusado_estado: string
          acusado_foto_url: string
          acusado_institucion: string
          acusado_nombres: string
          ai_score: number
          codigo: string
          created_at: string
          estado: Database["public"]["Enums"]["estado_revision"]
          moderado_en: string
          tipo: Database["public"]["Enums"]["tipo_delito"]
          updated_at: string
        }[]
      }
    }
    Enums: {
      estado_revision: "PENDIENTE" | "EN_REVISION" | "PUBLICADA" | "RECHAZADA"
      origen_denuncia:
        | "TESTIMONIO"
        | "REDES_SOCIALES"
        | "PRENSA"
        | "REGISTRO_OFICIAL"
        | "OTRO"
      tipo_delito: "CORRUPCIÓN" | "EXTORSIÓN" | "ABUSO DE AUTORIDAD" | "OTRO"
      tipo_evidencia: "IMAGEN" | "VIDEO" | "AUDIO" | "DOCUMENTO"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      estado_revision: ["PENDIENTE", "EN_REVISION", "PUBLICADA", "RECHAZADA"],
      origen_denuncia: [
        "TESTIMONIO",
        "REDES_SOCIALES",
        "PRENSA",
        "REGISTRO_OFICIAL",
        "OTRO",
      ],
      tipo_delito: ["CORRUPCIÓN", "EXTORSIÓN", "ABUSO DE AUTORIDAD", "OTRO"],
      tipo_evidencia: ["IMAGEN", "VIDEO", "AUDIO", "DOCUMENTO"],
    },
  },
} as const
