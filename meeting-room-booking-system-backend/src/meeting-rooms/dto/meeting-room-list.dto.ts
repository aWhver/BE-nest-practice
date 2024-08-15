export class MeetingRoomListDto {
  pageNo?: number;
  pageSize?: number;
  /** 会议室名称 */
  name?: string;
  /** 容纳人数 */
  capacity?: number;
  /** 包含的设备 */
  equipment?: string;
  /** 会议室位置 */
  location?: string;
}
