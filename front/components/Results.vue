<template>
  <svg class="result-chart" :viewBox="`0 0 ${width} ${height + 100}`"></svg>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'Results',
  props: {
    chartData: {
      type: Array,
      default: () => [
        {
          label: 'No Change',
          percent: 0,
          votes: 0
        },
        {
          label: 'Dual Token',
          percent: 0,
          votes: 0
        },
        {
          label: 'Transaction Split',
          percent: 0,
          votes: 0
        }
      ]
    },
    totalVoted: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      width: 960,
      height: 450
    }
  },
  computed: {
    radius() {
      return Math.min(this.width, this.height) / 2
    }
  },
  watch: {
    chartData: {
      handler: function(val, oldVal) {
        const changed = val.filter(function(p, idx) {
          return Object.keys(p).some(function(prop) {
            return p[prop] !== oldVal[idx][prop]
          })
        })
        if (changed.length > 0) {
          this.change(val)
        }
      },
      deep: true
    }
  },
  mounted() {
    this.init()
    this.change(this.chartData)
  },
  methods: {
    key: d => {
      return d.data.label
    },
    midAngle: d => {
      return d.startAngle + (d.endAngle - d.startAngle) / 2
    },
    init() {
      this.format = d3.format(',.0f')
      this.formatPercent = d3.format('.02f')
      this.color = d3.scaleOrdinal().range(['#0a81fa', '#0b4cd1', '#053188'])

      this.svg = d3
        .select(this.$el)
        .append('g')
        .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')')

      this.svg
        .append('circle')
        .attr('fill', 'none')
        .attr('stroke', '#e4e9f5')
        .attr('r', this.radius)

      this.svg.append('g').attr('class', 'slices')

      this.svg.append('g').attr('class', 'points')

      this.l = this.svg.append('g').attr('class', 'labels')

      this.l
        .append('text')
        .text('Votes')
        .attr('text-anchor', 'middle')
        .attr('dy', '2.5em')
        .attr('class', 'total-voted--label')

      this.l
        .append('text')
        .text('0')
        .attr('text-anchor', 'middle')
        .attr('dy', '.7em')
        .attr('class', 'total-voted--value')

      this.pie = d3
        .pie()
        .sort(null)
        .value(function(d) {
          return d.percent
        })
        .startAngle(Math.PI / 2)
        .endAngle(1.5 * Math.PI)

      this.arc = d3
        .arc()
        .outerRadius(this.radius * 0.8)
        .innerRadius(this.radius * 0.6)

      this.outerArc = d3
        .arc()
        .innerRadius(this.radius)
        .outerRadius(this.radius)

      this.change(this.chartData)
    },
    change(data) {
      const vm = this

      this.l
        .select('.total-voted--value')
        .transition()
        .duration(1000)
        .tween('text', function(d) {
          const that = d3.select(this)
          const _t = that.text()
          const i = d3.interpolate(_t.replace(/,/g, ''), vm.totalVoted)
          return function(t) {
            that.text(vm.format(i(t)))
          }
        })

      /* ------- PIE SLICES ------- */
      const slice = this.svg
        .select('.slices')
        .selectAll('path.slice')
        .data(vm.pie(data), vm.key)

      slice
        .enter()
        .insert('path')
        .style('fill', function(d) {
          return vm.color(d.data.label)
        })
        .attr('class', 'slice')

      slice
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return function(t) {
            return vm.arc(interpolate(t))
          }
        })

      slice.exit().remove()

      /* ------- TEXT LABELS ------- */
      const textPercents = this.svg
        .select('.labels')
        .selectAll('text.percent')
        .data(vm.pie(data), vm.key)

      textPercents
        .enter()
        .append('text')
        .attr('dy', '1.25em')
        .attr('class', 'percent')
        .style('opacity', 0)

      textPercents
        .transition()
        .duration(1000)
        .attrTween('transform', function(d) {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return function(t) {
            const d2 = interpolate(t)
            const pos = vm.outerArc.centroid(d2)
            return 'translate(' + pos + ')'
          }
        })
        .styleTween('text-anchor', function(d) {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return function(t) {
            const d2 = interpolate(t)
            return vm.midAngle(d2) < Math.PI ? 'start' : 'end'
          }
        })
        .tween('text', function(d) {
          const that = d3.select(this)
          const i = d3.interpolate(that.text(), d.data.percent)
          return function(t) {
            that.text(vm.formatPercent(i(t)) + '%')
          }
        })
        .style('opacity', function(d) {
          return d.data.percent < 1 ? 0 : 1
        })

      textPercents.exit().remove()

      const textVotes = this.svg
        .select('.labels')
        .selectAll('text.votes')
        .data(vm.pie(data), vm.key)

      textVotes
        .enter()
        .append('text')
        .attr('dy', '3.7em')
        .attr('class', 'votes')
        .style('opacity', 0)

      textVotes
        .transition()
        .duration(1000)
        .attrTween('transform', function(d) {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return function(t) {
            const d2 = interpolate(t)
            const pos = vm.outerArc.centroid(d2)
            return 'translate(' + pos + ')'
          }
        })
        .styleTween('text-anchor', function(d) {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return function(t) {
            const d2 = interpolate(t)
            return vm.midAngle(d2) < Math.PI ? 'start' : 'end'
          }
        })
        .tween('text', function(d) {
          const that = d3.select(this)
          const _t = that.text()
          const i = d3.interpolate(_t.replace(/,/g, ''), d.data.votes)
          return function(t) {
            that.text(vm.format(i(t)) + ' Votes')
          }
        })
        .style('opacity', function(d) {
          return d.data.percent < 1 ? 0 : 1
        })

      textVotes.exit().remove()

      const textLabels = this.svg
        .select('.labels')
        .selectAll('text.label')
        .data(vm.pie(data), vm.key)

      textLabels
        .enter()
        .append('text')
        .attr('dy', '4.95em')
        .attr('class', 'label')
        .text(function(d) {
          return d.data.label
        })
        .style('opacity', 0)

      textLabels
        .transition()
        .duration(500)
        .delay(500)
        .attr('transform', function(d) {
          return 'translate(' + vm.outerArc.centroid(d) + ')'
        })
        .style('text-anchor', function(d) {
          return vm.midAngle(d) < Math.PI ? 'start' : 'end'
        })
        .style('opacity', function(d) {
          return d.data.percent < 1 ? 0 : 1
        })

      textLabels.exit().remove()

      /* ------- POINTS OUTER ------- */

      const pointOuter = this.svg
        .select('.points')
        .selectAll('circle.outer')
        .data(vm.pie(data), vm.key)

      pointOuter
        .enter()
        .append('circle')
        .attr('stroke-width', 1)
        .attr('stroke', '#e4e9f5')
        .attr('fill', 'white')
        .attr('r', 16)
        .attr('class', 'outer')
        .attr('transform', function() {
          return 'translate(' + vm.radius + ', 0 )'
        })

      pointOuter
        .transition()
        .duration(1000)
        .attrTween('transform', function(d) {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return function(t) {
            const d2 = interpolate(t)
            const pos = vm.outerArc.centroid(d2)
            return 'translate(' + pos + ')'
          }
        })

      pointOuter.exit().remove()

      /* ------- POINTS INNER ------- */

      const pointInner = this.svg
        .select('.points')
        .selectAll('circle.inner')
        .data(vm.pie(data), vm.key)

      pointInner
        .enter()
        .append('circle')
        .attr('fill', function(d) {
          return vm.color(d.data.label)
        })
        .attr('r', 8)
        .attr('class', 'inner')
        .attr('transform', function() {
          return 'translate(' + vm.radius + ', 0 )'
        })

      pointInner
        .transition()
        .duration(1000)
        .attrTween('transform', function(d) {
          this._current = this._current || d
          const interpolate = d3.interpolate(this._current, d)
          this._current = interpolate(0)
          return function(t) {
            const d2 = interpolate(t)
            const pos = vm.outerArc.centroid(d2)
            return 'translate(' + pos + ')'
          }
        })

      pointInner.exit().remove()
    }
  }
}
</script>
