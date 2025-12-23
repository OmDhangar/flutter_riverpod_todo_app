import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class DioClient {
  final Dio _dio;

  DioClient() : _dio = Dio() {
    _dio.options.baseUrl = dotenv.env['API_BASE_URL']!;
    _dio.options.headers['Content-Type'] = 'application/json';
    // You can add other headers like Authorization here
  }

  Future<Response> get(String path) async {
    return await _dio.get(path);
  }

  Future<Response> post(String path, {data}) async {
    return await _dio.post(path, data: data);
  }

  Future<Response> patch(String path, {data}) async {
    return await _dio.patch(path, data: data);
  }

  Future<Response> delete(String path) async {
    return await _dio.delete(path);
  }
}
