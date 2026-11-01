const DATABASE_ERROR_CODES = new Set(['P1000', 'P1001', 'P1002', 'P1010'])

export function respondWithDatabaseUnavailable(res, error) {
  const isDatabaseError =
    error?.name === 'PrismaClientInitializationError' ||
    DATABASE_ERROR_CODES.has(error?.errorCode)

  if (!isDatabaseError) return false

  return res.status(503).json({
    error: 'Database unavailable',
    message:
      'The database could not be reached. Check DATABASE_URL, MariaDB availability, and database account host permissions.',
  })
}
