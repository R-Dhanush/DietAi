import React from 'react';
import { 
  ComposedChart, 
  Line, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import '../../styles/dashboard/ProgressGraph.css';

const ProgressGraph = ({ 
  weightHistory = [], 
  calorieHistory = [], 
  calorieTarget = 2000,
  waterHistory = [],
  waterTarget = 2000 
}) => {
  // Prepare data for last 7 days with better date handling
  const prepareWeeklyData = () => {
    const daysToShow = 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weeklyData = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const findEntry = (history) => history?.find(item => 
        new Date(item?.date).toISOString().split('T')[0] === dateStr
      );

      const weightEntry = findEntry(weightHistory);
      const calorieEntry = findEntry(calorieHistory);
      const waterEntry = findEntry(waterHistory);

      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        date: dateStr,
        weight: weightEntry?.value || null,
        calories: calorieEntry?.value || null,
        targetCalories: calorieTarget,
        water: waterEntry?.value || null,
        targetWater: waterTarget,
        waterPercentage: waterEntry?.value ? Math.min(Math.round((waterEntry.value / waterTarget) * 100), 100) : 0
      });
    }
    
    return weeklyData;
  };

  const weeklyData = prepareWeeklyData();
  const hasData = weeklyData.some(day => day.weight || day.calories || day.water);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{data.fullDate}</p>
          {data.weight && (
            <p className="tooltip-item">
              <span className="tooltip-label">Weight: </span>
              <span className="tooltip-value">{data.weight} kg</span>
            </p>
          )}
          {data.calories && (
            <p className="tooltip-item">
              <span className="tooltip-label">Calories: </span>
              <span className="tooltip-value">
                {data.calories} / {data.targetCalories} kcal
                {data.calories > data.targetCalories ? (
                  <span className="over">▲</span>
                ) : (
                  <span className="under">▼</span>
                )}
              </span>
            </p>
          )}
          {data.water && (
            <p className="tooltip-item">
              <span className="tooltip-label">Water: </span>
              <span className="tooltip-value">
                {data.water} / {data.targetWater} ml
                <div className="water-progress-bar">
                  <div 
                    className="water-progress-fill"
                    style={{ width: `${data.waterPercentage}%` }}
                  ></div>
                </div>
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="progress-graph-card">
      <h3>Weekly Progress</h3>
      <div className="chart-container">
        {hasData ? (
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart
              data={weeklyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#4CAF50"
                tick={{ fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
                label={{ 
                  value: 'Weight (kg)', 
                  angle: -90, 
                  position: 'insideLeft',
                  fill: '#4CAF50',
                  fontSize: 12
                }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#2196F3"
                tick={{ fill: '#666' }}
                axisLine={{ stroke: '#ddd' }}
                label={{ 
                  value: 'Calories/Water', 
                  angle: 90, 
                  position: 'insideRight',
                  fill: '#666',
                  fontSize: 12
                }}
              />
              
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 20 }}
              />
              
              {/* Weight Line */}
              <Line 
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                stroke="#4CAF50"
                name="Weight"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, fill: '#fff' }}
              />
              
              {/* Calories Bars */}
              <Bar 
                yAxisId="right"
                dataKey="calories"
                name="Calories"
                barSize={20}
                fill="#FF9800"
              >
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`calories-${index}`}
                    fill={entry.calories > entry.targetCalories ? '#F44336' : '#4CAF50'}
                  />
                ))}
              </Bar>
              
              {/* Target Calories Line */}
              <ReferenceLine 
                yAxisId="right"
                y={calorieTarget}
                stroke="#FF5722"
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                name="Calorie Target"
              />
              
              {/* Water Bars */}
              <Bar 
                yAxisId="right"
                dataKey="water"
                name="Water"
                barSize={20}
                fill="#2196F3"
              >
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`water-${index}`}
                    fill={entry.waterPercentage >= 100 ? '#1976D2' : '#64B5F6'}
                  />
                ))}
              </Bar>
              
              {/* Target Water Line */}
              <ReferenceLine 
                yAxisId="right"
                y={waterTarget}
                stroke="#0D47A1"
                strokeDasharray="5 5"
                strokeOpacity={0.7}
                name="Water Target"
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-data-message">
            <p>No progress data available for the past week</p>
            <p className="hint">Track your daily metrics to see progress here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressGraph;