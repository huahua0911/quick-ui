import Vue from 'vue'
import { cloneDeep, mergeWith, merge, isArray, debounce } from 'loadsh'
import { elComponentNames } from './dict'

/**
 * 设置 fieldGroup childrens
 * @param { * } childrens 组件子级
 */
const setChildrens = function (childrens) {
  const fieldObj = this
  const newChildrens = cloneDeep(hanlderChildrens(childrens, fieldObj.tag))
  this.childrens = newChildrens
}
/**
 * 设置 field 、fieldGroup props
 * @param { * } props 组件props
 */
const setProps = function (props) {
  const fieldObj = this
  const newFieldObj = mergeWith(fieldObj.config.props, props, customizer)
  this.config.props = newFieldObj
}

/**
 * 设置 field 、fieldGroup on
 * @param {*} on 组件事件
 */
const setOn = function (on) {
  const fieldObj = this
  const newFieldObj = mergeWith(fieldObj.config.on, on, customizer)
  this.config.on = newFieldObj
}

const setFieldFun = function (obj) {
  obj.setChildrens = setChildrens
  obj.setProps = setProps
  obj.setOn = setOn
  return obj
}

/**
 * 判断是否 element 标签
 * @param {*} tag 
 * @returns 
 */
const getTag = (tag) => {
  // 是element标签自动加上el-
  if (elComponentNames.includes(tag)) {
    return `el-${tag}`
  }
  return tag
}
/**
 * 处理子级
 * @param {*} childrens 子级数组
 * @param {*} parentTag 父级标签
 * @returns 
 */
const hanlderChildrens = (childrens, parentTag) => {
  let childTag = ''
  switch (parentTag) {
    case 'el-Select':
      childTag = 'el-option'
      break;
    case 'el-RadioGroup':
      childTag = 'el-radio'
      break;
    case 'el-CheckboxGroup':
      childTag = 'el-checkbox'
      break;
    default:
      break;
  }
  return childrens ? cloneDeep(childrens).map(item => {
    item.tag = childTag
    if (childTag === 'el-radio') {
      item.props = { label: item.value }
    } else {
      item.props = { value: item.value, label: item.label }
    }
    item.text = item.label
    return item
  }) : []
}
/**
 * 特殊组件处理 config
 * @param {*} config 
 * @param {*} tag 
 * @param {*} label 
 * @returns 
 */
const hanlderConfig = (config, tag, label) => {
  const attrs = { placeholder: config.placeholder || label }
  const props = { clearable: true }
  if (tag === 'DatePicker' && config.props && config.props.type && config.props.type.indexOf('range') !== -1) {
    props.startPlaceholder = '开始日期'
    props.endPlaceholder = '结束日期'
    props.defaultTime = ['00:00:00', '23:59:59']
  }
  if (tag === 'TimePicker' && config.props && config.props.isRange) {
    props.startPlaceholder = '开始时间'
    props.endPlaceholder = '结束时间'
  }
  return { attrs , props }
}

const customizer = (obj, src) =>{
  if (isArray(src)) {
    return src
  }
}

/**
 * 生成动态组件
 * @param {*} field 字段key
 * @param {*} label 字段名
 * @param {*} tag 动态标签
 * @param {*} config 配置项 参考 https://v2.cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1
 * @returns 
 */
export const formField = (field, label, tag = 'Input', config = {}) => {
  const t = getTag(tag)
  const { attrs, props } = hanlderConfig(config, tag, label)
  return setFieldFun({
    tag: t,
    field,
    label,
    config: merge({attrs, props}, config)
  })
}
/**
 * 生成动态组件  Select RadioGroup CheckboxGroup
 * @param {*} field 字段key
 * @param {*} label 字段名
 * @param {*} childrens 子级
 * @param {*} tag 标签 (支持 Select RadioGroup CheckboxGroup 默认Select)
 * @param {*} config 配置项 参考 https://v2.cn.vuejs.org/v2/guide/render-function.html#%E6%B7%B1%E5%85%A5%E6%95%B0%E6%8D%AE%E5%AF%B9%E8%B1%A1
 * @returns 
 */
export const formFieldGroup = (field, label, childrens, tag = 'Select', config = {}) => {
  const t = getTag(tag)
  const attrs = { placeholder: config.placeholder || label }
  const props = { clearable: true, filterable: true }
  return setFieldFun({
    tag: t,
    field,
    label,
    childrens: hanlderChildrens(childrens, t),
    config: merge({attrs, props }, config)
  })
}

export const formTitle = (title, config = {}) => {
  return {
    tag: 'div',
    config: {
      ...config,
      formItemClass: 'form-is-full form-title' + (config.formItemClass ? ` ${config.formItemClass}` : '')
    },
    childrens: title
  }
}
/**
 * 改变 fields 属性
 * @param {*} items
 * @param {*} index
 * @param {*} newField
 */
export const changeFieldsByIndex = (fields, index, newField) => {
  if (newField.childrens) {
    newField.childrens = cloneDeep(hanlderChildrens(newField.childrens, fields[index].tag))
  }
  Vue.set(fields, index, mergeWith(fields[index], newField, customizer))
}

/**
 * 根据 prop 改变 fields 属性
 * @param {*} fields
 * @param {*} index
 * @param {*} props
 */
export const changeFieldsByProp = (fields, field, props) => {
  const findIndex = fields.findIndex(item => item.field === field)
  changeFieldsByIndex(fields, findIndex, props)
}

// ----------------- 列表 按钮---------------
export const generateBtns = (h, params, buttons) => {
  const filterButtons = buttons.filter(item => !!item)
  const generateButtons = filterButtons.map(item => {
    return h('span',
      {
        style: item.style,
        on: {
          click: debounce(() => {
            if (!item.click) {
              console.error(`click event is not undefined`);
              return
            } else if (typeof item.click !== 'function') {
              console.error(`click event is not function`);
              return
            }
            item.click(params.row)
          }, 200)
        },
        class: `list-btn ${item.class || ''}`
      },
      item.text
    )
  })
  return h(
    "div",
    generateButtons
  )
}