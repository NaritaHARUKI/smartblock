import * as React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { setBlockType } from 'prosemirror-commands'
import { Fragment } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { Extension, ExtensionProps } from '../../types'
import { blockActive } from '../../utils'
import LinkIcon from '../../components/icons/link'
import Popup from './popup'
import Plugin from './plugin'

export default class Embed extends Extension {
  constructor(props?: ExtensionProps) {
    super(props)
  }

  get name() {
    return 'embed'
  }

  get group() {
    return 'block'
  }

  get showMenu() {
    return true
  }

  get hideInlineMenuOnFocus() {
    return true
  }

  get schema() {
    if (this.customSchema) {
      return this.customSchema
    }
    return {
      group: 'block',
      content: 'text*',
      selectable: true,
      isolating: true,
      attrs: {
        type: { default: 'youtube' },
        src: { default: '' }
      },
      parseDOM: [
        {
          tag: 'iframe',
          getAttrs(dom) {
            return {
              src: dom.getAttribute('src')
            }
          }
        },
        {
          tag: 'div.embed-wrap',
          getAttrs(dom) {
            const a = dom.querySelector('a')
            return { src: a.getAttribute('href') }
          }
        }
      ],
      toDOM: node => {
        if (node.attrs.src.indexOf('youtube') !== -1) {
          //console.log('index.tsx');
          const { src } = node.attrs
          let youtubeId = ''
          const matches = /www\.youtube\.com\/watch\?v=(.*?)$/.exec(src)
          if (matches && matches[1]) {
            youtubeId = matches[1]
          }
          if (!youtubeId) {
            const embedMatches = /www\.youtube\.com\/embed\/(.*?)$/.exec(src)
            if (embedMatches && embedMatches[1]) {
              youtubeId = embedMatches[1]
            }
          }
          if (youtubeId) {
            const url = `https://www.youtube.com/embed/${youtubeId}`
            return [
              'div',
              {
                contenteditable: true,
                class: 'youtube-frame-wrap'
              },
              [
                'div',
                {
                  class: 'youtube-frame'
                },
                [
                  'iframe',
                  {
                    src: url
                  }
                ]
              ]
            ]
          }
        }

        if(node.attrs.src.indexOf('maps') !== -1){
          const src = node.attrs.src;
         if(node.attrs.src.indexOf('@') !== -1){
          var result1dStart = src.lastIndexOf('@');
          var result1dEnd = src.indexOf(',');
          var latitude = src.slice(result1dStart+1,result1dEnd);
          var result2dEnd = src.lastIndexOf(',');
          var longitude = src.slice(result1dEnd+1,result2dEnd);
          let url = `https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d13044.751028159491!2d${longitude}!3d${latitude}!3m2!1i1024!2i768!4f13.1!5e0`;
          return [
            'div',
            {
              contenteditable: true,
              class: 'gmap-frame-wrap'
            },
            [
              'div',
              {
                class: 'gmap-frame'
              },
              [
                'iframe',
                {
                  src: url
                }
              ]
            ]
          ]
          
        }if(node.attrs.src.indexOf('@') === -1){
          var result1dStart = src.lastIndexOf('1d');
          var result1dEnd = src.lastIndexOf('!2d');
          var zoom = src.slice(result1dStart+2,result1dEnd);

          var result2dEnd = src.lastIndexOf('!3d');
          var latitude = src.slice(result1dEnd+3,result2dEnd);
   
          var result3dEnd = src.lastIndexOf('!2m3!1f0');
          var longitude = src.slice(result2dEnd+3,result3dEnd);

          var resultCidStart = src.lastIndexOf('1s0x');
          var resultCidEnd = src.lastIndexOf('!2z');
          var cid = src.slice(resultCidStart+2,resultCidEnd);

          var resultPlace =  src.lastIndexOf('!5e');
          var place = src.slice(resultCidEnd+3,resultPlace);
          let url = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d${zoom}!2d${latitude}!3d${longitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s${cid}!2z${place}!5e0`;
          console.log(url);
          return [
            'div',
            {
              contenteditable: true,
              class: 'youtube-frame-wrap'
            },
            [
              'div',
              {
                class: 'youtube-frame'
              },
              [
                'iframe',
                {
                  src: url
                }
              ]
            ]
          ]
          
          }

      

        }
        return [
          'div',
          {
            class: 'embed-wrap'
          },
          [
            'a',
            {
              class: 'embed',
              href: node.attrs.src
            },
            [
              'div',
              {
                class: 'embed-inner'
              },
              0
            ]
          ]
        ]
      }
    }
  }

  get icon() {
    return <LinkIcon style={{ width: '24px', height: '24px' }} />
  }

  active(state) {
    return blockActive(state.schema.nodes.embed)(state)
  }

  enable(state) {
    return setBlockType(state.schema.nodes.embed)(state)
  }

  onClick(state: EditorState, dispatch) {
    const div = document.createElement('div')
    document.body.appendChild(div)
    render(
      <Popup
        onClose={() => {
          unmountComponentAtNode(div)
        }}
        onDone={src => {
          const { pos } = state.selection.$anchor
          const text = state.schema.text(src)
          const node = state.schema.nodes.embed.createAndFill(
            {
              src
            },
            text
          )
          dispatch(state.tr.insert(pos, node))
          unmountComponentAtNode(div)
        }}
      />,
      div
    )
  }

  get plugins() {
    return [Plugin()]
  }

  
}
