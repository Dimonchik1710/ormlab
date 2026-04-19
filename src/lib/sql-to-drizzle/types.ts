// Supported database dialects
export type SqlDialect = "postgresql" | "mysql" | "sqlite";

// Represents a single column in a table
export interface ColumnDefinition {
  name: string;           // Column name as-is from SQL
  sqlType: string;        // Raw SQL type like "VARCHAR(255)", "INT", "TEXT"
  typeParams?: number[];  // Params from type: VARCHAR(255) → [255]
  nullable: boolean;      // Is NULL allowed
  primaryKey: boolean;    // Is this a PRIMARY KEY
  unique: boolean;        // Has UNIQUE constraint
  defaultValue?: string;  // DEFAULT value if present (raw SQL expression)
  autoIncrement: boolean; // SERIAL / AUTO_INCREMENT / GENERATED
  references?: {          // FOREIGN KEY
    table: string;
    column: string;
    onDelete?: string;
  };
}

// Represents a parsed table
export interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
}

// Final result of conversion
export interface ConversionResult {
  success: boolean;
  drizzleCode?: string;   // Generated TypeScript code
  errors: string[];       // Parse errors, unsupported features, etc.
  warnings: string[];     // Things user should double-check
}

// Options for the converter
export interface ConvertOptions {
  dialect: SqlDialect;
  includeImports: boolean;   // Generate `import` statements
  includeRelations: boolean; // Generate references() calls
}