class SimpleResponse {
  const SimpleResponse(this.message, this.statusCode, [this.retValue])
      : isSuccessful = (statusCode < 300 && statusCode >= 200);
  final String message;
  final int statusCode;
  final bool isSuccessful;
  final dynamic retValue;

  dynamic get value => retValue;
}
