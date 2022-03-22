import sensors, { init } from './sensors';

const start = () => {
  init(
    {
      show_log: false,
      server_url: `https://sc-datasink.ffe390afd658c19dcbf707e0597b846d.de/sa?project=${
        process.env.ENV === 'prod' ? 'production' : 'default'
      }`,
      abUrl:
        'https://sc-abtest.ffe390afd658c19dcbf707e0597b846d.de/api/v2/abtest/online/results?project-key=04998C9B84A38A7D810A5ADAF48229BA568BF954',
    },
    {
      app_id: 10009,
      env: process.env.ENV,
      project_type: 'teleport',
      project_name: 'teleport_wallet',
      page_name: document && document.title,
    }
  );
};

export default {
  start,
  sensors,
};
