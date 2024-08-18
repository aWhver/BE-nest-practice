import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class StatisticQueryPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const _value = { ...value };
    if (!_value.startTime) {
      if (_value.endTime) {
        _value.startTime = +_value.endTime - 7 * 24 * 60 * 60 * 1000;
      } else {
        _value.startTime = Date.now();
      }
    }
    if (!_value.endTime) {
      if (_value.startTime) {
        _value.endTime = _value.startTime + 7 * 24 * 60 * 60 * 1000;
      }
    }
    return _value;
  }
}
