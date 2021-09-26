class DnsModel {
  DnsModel(this.ipv4Adresses, this.ipv6Adresses);

  DnsModel.fromJson(Map<String, dynamic> json)
      : ipv4Adresses = json.containsKey("IPV4 address")
            ? (json["IPV4 address"] as List<dynamic>)
                .map((adr) => adr as String)
                .toList()
            : [],
        ipv6Adresses = json.containsKey("IPV6 address")
            ? (json["IPV6 address"] as List<dynamic>)
                .map((adr) => adr as String)
                .toList()
            : [],
        mailServer = json.containsKey("MX") ? json["MX"][0]["exchange"] : null;

  List<String> ipv4Adresses;
  List<String> ipv6Adresses;
  String? mailServer;
}
