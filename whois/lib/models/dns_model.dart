class DnsModel {
  DnsModel(this.address, this.ttl, this.type);

  DnsModel.fromJson(Map<String, dynamic> json)
      : address = json["address"],
        ttl = json["ttl"],
        type = json["type"];

  String address;
  int ttl;
  String type;
}
