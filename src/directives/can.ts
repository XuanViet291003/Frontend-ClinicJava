import type { Directive } from 'vue'
import { getCurrentUser } from '../lib/auth'

const can: Directive = {
  mounted(el, binding) {
    const roleRequired = binding.value as string | string[]
    const user = getCurrentUser()
    if (!user) {
      el.style.display = 'none'
      return
    }

    const roles = Array.isArray(roleRequired) ? roleRequired : [roleRequired]
    const allowed = roles.some(r => user.role === r)
    if (!allowed) el.style.display = 'none'
  }
}

export default can
