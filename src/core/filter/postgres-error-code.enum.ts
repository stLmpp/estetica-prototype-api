export enum PostgresErrorCode {
  // Raised by current_setting() when the @MainTransactional() session variable was never set.
  UndefinedObject = '42704',
}
