import { keyringService } from "background/service"

/**
 * 是否已经设定过密码
 * @returns boolean
 */
export const localHasPwd = () => {
  return keyringService.hasOwnPassword()
}