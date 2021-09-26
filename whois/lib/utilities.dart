import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

showToast(String text, Color toastColor, FToast fToast) {
  Widget toast = Container(
    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 20.0),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(30.0),
      color: toastColor,
    ),
    child: Text(text, style: TextStyle(fontSize: 18)),
  );

  fToast.removeCustomToast();

  fToast.showToast(
    child: toast,
    gravity: ToastGravity.BOTTOM,
    toastDuration: Duration(seconds: 3),
  );
}

SlideTransition slideIt(Animation<double> animation, Widget child) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(1, 0),
        end: const Offset(0, 0),
      ).animate(animation),
      child: child,
    );
  }