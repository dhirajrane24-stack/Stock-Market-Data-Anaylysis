export interface SampleDatasetConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  rowCount: number;
  csvContent: string;
}

export const SAMPLE_DATASETS: SampleDatasetConfig[] = [
  {
    id: 'global-sales',
    name: 'Global Retail & Sales 2024',
    category: 'E-Commerce & Retail',
    description: 'Transaction-level data with product lines, regions, discounts, revenues, and profit margins.',
    rowCount: 25,
    csvContent: `Date,Order ID,Customer,Category,Product,Units,Unit Price,Revenue,Discount,Profit,Region,Payment Method
2024-01-05,ORD-1001,Acme Corp,Electronics,MacBook Pro 16,5,2499,12495,500,3200,North America,Credit Card
2024-01-07,ORD-1002,Global Logistics,Office,Ergonomic Chair,15,350,5250,250,1450,Europe,Bank Wire
2024-01-10,ORD-1003,Starlight Studio,Audio,Studio Headphones,8,299,2392,0,890,North America,Credit Card
2024-01-12,ORD-1004,Zenith Labs,Monitors,4K Curved Monitor,10,650,6500,300,1800,Asia Pacific,PayPal
2024-01-15,ORD-1005,Horizon Tech,Electronics,Dell XPS 15,6,1899,11394,400,2900,North America,Credit Card
2024-01-18,ORD-1006,Apex Retail,Wearables,Smart Fitness Watch,20,199,3980,180,1200,LATAM,PayPal
2024-01-20,ORD-1007,BioHealth Ltd,Office,Standing Desk,8,550,4400,200,1100,Europe,Bank Wire
2024-01-22,ORD-1008,Nova Dynamics,Audio,Wireless Earbuds,25,129,3225,150,980,Asia Pacific,Credit Card
2024-01-25,ORD-1009,Vanguard Media,Monitors,UltraWide 38-inch,4,999,3996,196,1150,Europe,Bank Wire
2024-01-28,ORD-1010,CyberSafe Inc,Electronics,ThinkPad X1 Carbon,7,1750,12250,500,3100,North America,Credit Card
2024-02-02,ORD-1011,Polaris Health,Wearables,GPS Sport Watch,12,249,2988,100,850,LATAM,Credit Card
2024-02-05,ORD-1012,Quantum Leap,Monitors,Gaming OLED 27,8,799,6392,250,1720,North America,Credit Card
2024-02-08,ORD-1013,Hyperion Software,Office,Desk Organizer Set,40,45,1800,50,620,Asia Pacific,PayPal
2024-02-12,ORD-1014,Solaris Energy,Audio,Noise Cancelling Pro,14,349,4886,200,1400,Europe,Credit Card
2024-02-15,ORD-1015,Matrix AI,Electronics,Mac Studio M2,3,3999,11997,400,3400,North America,Bank Wire
2024-02-18,ORD-1016,Crestview Capital,Office,Executive Mesh Chair,12,420,5040,240,1350,North America,Bank Wire
2024-02-22,ORD-1017,Nimbus Cloud,Wearables,Smart Ring Tracker,18,299,5382,200,1650,Europe,PayPal
2024-02-25,ORD-1018,Omega Logistics,Monitors,Dual Monitor Arm,22,149,3278,120,950,LATAM,Credit Card
2024-02-28,ORD-1019,Terra Solutions,Audio,Desktop Soundbar,16,189,3024,100,880,Asia Pacific,PayPal
2024-03-02,ORD-1020,Vertex Robotics,Electronics,Surface Laptop 5,8,1499,11992,350,2850,North America,Credit Card
2024-03-05,ORD-1021,Aura Design,Monitors,Color Calibrated 32,5,1199,5995,200,1650,Europe,Credit Card
2024-03-08,ORD-1022,Beacon Group,Wearables,Smart Band HR,30,89,2670,120,780,LATAM,PayPal
2024-03-12,ORD-1023,Cascade Ventures,Office,Acoustic Room Divider,6,650,3900,150,1050,North America,Bank Wire
2024-03-15,ORD-1024,Titan Corp,Electronics,iPad Pro 12.9,11,1099,12089,450,2950,Asia Pacific,Credit Card
2024-03-18,ORD-1025,Pinnacle Systems,Audio,Podcast Mic Kit,15,199,2985,100,920,Europe,Credit Card`,
  },
  {
    id: 'saas-metrics',
    name: 'SaaS Customer & Churn Analytics',
    category: 'Product & SaaS',
    description: 'Subscription data tracking monthly recurring revenue (MRR), health scores, and customer retention.',
    rowCount: 20,
    csvContent: `Company,Subscription Tier,Seats,MRR,Signup Date,NPS Score,Health Score,Support Tickets,Days Active/Mo,Churn Risk
AlphaFin,Enterprise,120,4800,2023-03-15,68,92,2,26,Low
ByteWave,Pro,35,1050,2023-06-20,45,74,5,18,Medium
CloudNest,Starter,8,240,2023-08-11,25,58,8,12,High
DeltaCore,Enterprise,250,9500,2022-11-04,78,96,1,28,Low
EchoData,Pro,45,1350,2023-04-18,52,80,3,22,Low
FlowState,Starter,5,150,2023-09-02,15,45,11,9,High
GridPulse,Pro,60,1800,2023-01-29,60,84,4,24,Low
HexaShield,Enterprise,180,7200,2023-02-14,72,94,2,27,Low
IronPeak,Starter,12,360,2023-07-22,30,62,7,14,Medium
JumpScale,Pro,50,1500,2023-05-19,55,81,3,21,Low
KiteLogic,Starter,4,120,2023-10-05,10,40,12,7,High
LumenAI,Enterprise,300,11500,2022-09-17,85,98,0,29,Low
Mavensys,Pro,28,840,2023-08-30,40,71,6,16,Medium
Nexar,Starter,10,300,2023-06-14,35,66,5,15,Medium
OmniStream,Enterprise,140,5600,2023-01-10,65,88,3,25,Low
PeakOps,Pro,40,1200,2023-03-25,58,82,2,23,Low
QuartzHealth,Enterprise,200,8000,2022-12-08,80,95,1,28,Low
Riverbank,Starter,6,180,2023-09-19,20,52,9,11,High
SkylineB2B,Pro,55,1650,2023-04-05,62,85,3,22,Low
TrueSync,Enterprise,160,6400,2023-02-01,70,90,2,26,Low`,
  },
  {
    id: 'marketing-campaigns',
    name: 'Digital Ad Campaigns & ROI',
    category: 'Marketing',
    description: 'Ad performance across Meta, Google, LinkedIn, TikTok with spend, CTR, conversions and ROAS.',
    rowCount: 18,
    csvContent: `Campaign Name,Platform,Objective,Spend,Impressions,Clicks,Conversions,Revenue,CTR,CPC,ROAS
Q1 Brand Awareness,Google Ads,Reach,12500,1450000,43500,820,38540,3.00,0.29,3.08
Retargeting High Intent,Meta Ads,Conversions,8400,320000,19200,1140,42180,6.00,0.44,5.02
Summer SaaS Launch,LinkedIn,Lead Gen,15000,280000,8400,420,49500,3.00,1.79,3.30
GenZ TikTok Blitz,TikTok,Engagement,6200,980000,39200,680,21760,4.00,0.16,3.51
Search Non-Brand,Google Ads,Conversions,18200,650000,32500,1350,76950,5.00,0.56,4.23
B2B Enterprise Decision,LinkedIn,Lead Gen,14000,190000,5700,310,65100,3.00,2.46,4.65
Instagram Reels Video,Meta Ads,Conversions,7800,740000,29600,890,32040,4.00,0.26,4.11
Competitor Keyword Capture,Google Ads,Conversions,9500,180000,12600,540,29700,7.00,0.75,3.13
Influencer Showcase,TikTok,Conversions,5400,820000,24600,510,18360,3.00,0.22,3.40
Holiday Catalog Push,Meta Ads,Conversions,11200,680000,34000,1420,58220,5.00,0.33,5.20
Industry Report Download,LinkedIn,Lead Gen,9800,220000,7700,460,34500,3.50,1.27,3.52
YouTube Pre-Roll 30s,YouTube,Reach,8900,1150000,23000,390,19500,2.00,0.39,2.19
Local Geo-Targeted Search,Google Ads,Conversions,4600,120000,8400,410,21320,7.00,0.55,4.63
Podcast Sponsorship Boost,Meta Ads,Traffic,3800,210000,8400,220,9900,4.00,0.45,2.61
Display Network Remind,Google Ads,Retargeting,5100,890000,13350,330,14850,1.50,0.38,2.91
Executive Thought Leadership,LinkedIn,Engagement,7500,160000,4800,240,24000,3.00,1.56,3.20
Spring Sale Dynamic Ads,Meta Ads,Conversions,10500,620000,31000,1280,53760,5.00,0.34,5.12
Product Hunt Aftermath,Google Ads,Conversions,3200,95000,6650,290,14210,7.00,0.48,4.44`,
  },
  {
    id: 'healthcare-vitals',
    name: 'Clinical Health & Patient Vitals',
    category: 'Healthcare',
    description: 'Patient biometric data tracking blood pressure, cholesterol, glucose, BMI, and cardiovascular risk.',
    rowCount: 20,
    csvContent: `Patient ID,Age,Gender,Systolic BP,Diastolic BP,BMI,Glucose,Cholesterol,Heart Rate,Smoker,Risk Category
P-201,45,Male,128,82,24.8,98,185,72,No,Low
P-202,62,Female,148,94,29.3,135,242,78,Yes,High
P-203,38,Female,118,76,22.1,88,168,68,No,Low
P-204,55,Male,156,98,31.4,142,260,84,Yes,High
P-205,49,Male,134,86,26.5,104,210,74,No,Moderate
P-206,71,Female,162,102,28.7,158,255,80,No,High
P-207,33,Male,120,78,23.4,92,175,66,No,Low
P-208,58,Female,142,90,30.1,128,230,76,Yes,High
P-209,42,Female,124,80,24.2,95,190,70,No,Low
P-210,67,Male,158,96,27.8,150,248,82,Yes,High
P-211,29,Female,114,72,21.5,85,160,64,No,Low
P-212,52,Male,138,88,28.2,112,218,75,No,Moderate
P-213,47,Female,130,84,25.9,101,205,73,No,Moderate
P-214,64,Male,152,94,32.6,145,265,86,Yes,High
P-215,36,Male,122,78,23.9,90,180,69,No,Low
P-216,59,Female,144,92,27.4,122,225,77,No,Moderate
P-217,41,Male,126,82,25.1,96,195,71,No,Low
P-218,68,Female,160,98,30.8,162,270,83,Yes,High
P-219,53,Male,136,86,26.9,108,215,74,No,Moderate
P-220,31,Female,116,74,22.4,86,165,65,No,Low`,
  },
];
